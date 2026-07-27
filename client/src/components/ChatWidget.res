// "Ask about Arda" — a floating enquiry slip that POSTs to the ai.arda.tr bot's
// SSE /api/chat/stream (falling back to the non-streaming /api/chat) and renders
// Markdown via Markdown.res. The bot holds the API key, so this static site
// ships no secrets. Other parts of the page open it via the `arda:open-chat`
// window event.
type chatMsg = {
  id: int,
  role: string, // "user" | "model"
  content: string,
  isError: bool,
}

// POST the message + prior history; calls onReply(text) or onError().
// Aborts after 30s so a hung request can't pin the widget in its busy state.
let postChat: (string, array<chatMsg>, string => unit, unit => unit) => unit = %raw(`
  function (message, history, onReply, onError) {
    var hist = (history || []).map(function (m) {
      return { role: m.role, content: m.content };
    });
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 30000);
    var done = false;
    function finish(fn, arg) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      fn(arg);
    }
    fetch("https://ai-arda-tr-api-599610058688.asia-northeast1.run.app/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: message, history: hist }),
      signal: controller.signal,
    })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && typeof j.reply === "string" && j.reply.length > 0) {
          finish(onReply, j.reply);
        } else {
          finish(onError);
        }
      })
      .catch(function () { finish(onError); });
  }
`)

// Streaming variant: POSTs to the SSE /api/chat/stream endpoint and calls
// onChunk(fullTextSoFar) as tokens arrive, onDone(fullText) at the end, or
// onError() if the stream fails before any token (caller falls back to postChat).
// Aborts after 45s. SSE shape: `data: {"type":"thinking"|"chunk"|"done","text"?}`.
let postChatStream: (
  string,
  array<chatMsg>,
  string => unit,
  string => unit,
  unit => unit,
) => unit = %raw(`
  function (message, history, onChunk, onDone, onError) {
    var hist = (history || []).map(function (m) {
      return { role: m.role, content: m.content };
    });
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 45000);
    var settled = false;
    function fail() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      onError();
    }
    function finish(full) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      onDone(full);
    }
    fetch("https://ai-arda-tr-api-599610058688.asia-northeast1.run.app/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
      body: JSON.stringify({ message: message, history: hist }),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok || !res.body) { fail(); return; }
        var reader = res.body.getReader();
        var decoder = new TextDecoder();
        var buffer = "";
        var full = "";
        function pump() {
          return reader.read().then(function (r) {
            if (r.done) {
              buffer += decoder.decode(); // flush any trailing multi-byte char
            } else {
              buffer += decoder.decode(r.value, { stream: true });
            }
            // SSE events are blank-line separated; tolerate LF or CRLF framing.
            var events = buffer.split(/\r?\n\r?\n/);
            buffer = r.done ? "" : (events.pop() || ""); // keep the trailing partial event
            for (var k = 0; k < events.length; k++) {
              var dataLines = events[k].split(/\r?\n/).filter(function (l) {
                return l.indexOf("data:") === 0;
              });
              if (dataLines.length === 0) continue;
              var payload = dataLines
                .map(function (l) { return l.slice(5).replace(/^ /, ""); })
                .join("\n");
              var obj;
              try { obj = JSON.parse(payload); } catch (e) { continue; }
              if (obj.type === "chunk" && typeof obj.text === "string") {
                full += obj.text;
                onChunk(full);
              } else if (obj.type === "done") {
                if (typeof obj.text === "string" && obj.text.length > 0) full = obj.text;
                finish(full);
                return;
              } else if (obj.type === "error") {
                fail();
                return;
              }
            }
            // Stream ended without an explicit done event — settle with what we have.
            if (r.done) { finish(full); return; }
            return pump();
          });
        }
        return pump();
      })
      .catch(function () { fail(); });
  }
`)

let scrollToBottom: Dom.element => unit = %raw(`function (el) { if (el) el.scrollTop = el.scrollHeight; }`)
let focusEl: Dom.element => unit = %raw(`function (el) { if (el) el.focus(); }`)

let onEscape: (unit => unit) => (unit => unit) = %raw(`
  function (close) {
    function onKey(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onKey);
    return function () { document.removeEventListener("keydown", onKey); };
  }
`)

// Lets any other part of the page open the widget without sharing React state.
let openChat: unit => unit = %raw(`
  function () {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("arda:open-chat"));
    }
  }
`)

let listenForOpen: (unit => unit) => (unit => unit) = %raw(`
  function (cb) {
    function handler() { cb(); }
    window.addEventListener("arda:open-chat", handler);
    return function () { window.removeEventListener("arda:open-chat", handler); };
  }
`)

let bubble = (msg: chatMsg) => {
  let isModel = msg.role != "user" && !msg.isError
  <div
    key={Int.toString(msg.id)}
    className={"flex " ++ (msg.role == "user" ? "justify-end" : "justify-start")}>
    <div
      className={"chat-bubble " ++ (
        msg.role == "user"
          ? "chat-bubble--user whitespace-pre-wrap"
          : msg.isError
          ? "chat-bubble--err whitespace-pre-wrap"
          : ""
      )}>
      {isModel ? <Markdown text={msg.content} /> : React.string(msg.content)}
    </div>
  </div>
}

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let c = t.chat
  let (isOpen, setIsOpen) = React.useState(() => false)
  let (input, setInput) = React.useState(() => "")
  let (messages, setMessages) = React.useState(() => [])
  let (busy, setBusy) = React.useState(() => false)
  let (streaming, setStreaming) = React.useState(() => false)
  let idRef = React.useRef(0)
  let listRef = React.useRef(Nullable.null)
  let inputRef = React.useRef(Nullable.null)
  let launcherRef = React.useRef(Nullable.null)

  let nextId = () => {
    let id = idRef.current
    idRef.current = id + 1
    id
  }

  // Keep the transcript pinned to the latest message / thinking indicator.
  let lastLen = switch messages->Array.get(Array.length(messages) - 1) {
  | Some(m) => String.length(m.content)
  | None => 0
  }
  React.useEffect1(() => {
    switch listRef.current->Nullable.toOption {
    | Some(el) => scrollToBottom(el)
    | None => ()
    }
    None
  }, [Int.toString(Array.length(messages)) ++ ":" ++ Int.toString(lastLen) ++ ":" ++ (busy ? "1" : "0")])

  // On open: focus the input and wire Escape-to-close. On close, the cleanup
  // returns focus to the launcher so keyboard users aren't stranded (the dialog
  // is non-modal — a floating enquiry slip — so we restore focus rather than
  // trap it).
  React.useEffect1(() => {
    if isOpen {
      switch inputRef.current->Nullable.toOption {
      | Some(el) => focusEl(el)
      | None => ()
      }
      let removeEscape = onEscape(() => setIsOpen(_ => false))
      Some(
        () => {
          removeEscape()
          switch launcherRef.current->Nullable.toOption {
          | Some(el) => focusEl(el)
          | None => ()
          }
        },
      )
    } else {
      None
    }
  }, [isOpen])

  React.useEffect0(() => Some(listenForOpen(() => setIsOpen(_ => true))))

  let submit = text => {
    let trimmed = String.trim(text)
    if trimmed !== "" && !busy {
      // Don't replay client-side error bubbles back to the model as history.
      let history = messages->Array.filter(m => !m.isError)
      let modelId = nextId()
      let started = ref(false)
      let addOrUpdate = full =>
        setMessages(prev =>
          if started.contents {
            prev->Array.map(m => m.id == modelId ? {...m, content: full} : m)
          } else {
            started := true
            Array.concat(prev, [{id: modelId, role: "model", content: full, isError: false}])
          }
        )
      setMessages(prev =>
        Array.concat(prev, [{id: nextId(), role: "user", content: trimmed, isError: false}])
      )
      setInput(_ => "")
      setBusy(_ => true)
      setStreaming(_ => false)
      postChatStream(
        trimmed,
        history,
        full => {
          if !started.contents {
            setStreaming(_ => true)
          }
          addOrUpdate(full)
        },
        full => {
          addOrUpdate(full)
          setStreaming(_ => false)
          setBusy(_ => false)
        },
        () => {
          if started.contents {
            setStreaming(_ => false)
            setBusy(_ => false)
          } else {
            postChat(
              trimmed,
              history,
              reply => {
                setMessages(prev =>
                  Array.concat(prev, [{id: modelId, role: "model", content: reply, isError: false}])
                )
                setBusy(_ => false)
              },
              () => {
                setMessages(prev =>
                  Array.concat(prev, [{id: modelId, role: "model", content: c.error, isError: true}])
                )
                setBusy(_ => false)
              },
            )
          }
        },
      )
    }
  }

  let canSend = String.trim(input) !== "" && !busy

  <>
    {isOpen
      ? React.null
      : <div className="chat-launcher no-print">
          <button
            ref={ReactDOM.Ref.domRef(launcherRef)}
            type_="button"
            onClick={_ => setIsOpen(_ => true)}
            ariaHaspopup=#dialog
            className="slip">
            {React.string(c.launcher)}
          </button>
        </div>}
    {isOpen
      ? <div role="dialog" ariaLabel={c.title} className="chat-panel no-print">
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-ink bg-stock-deep px-q py-2">
            <div>
              <p className="t-label"> {React.string("AI · Gemini")} </p>
              <p className="t-entry"> {React.string(c.title)} </p>
            </div>
            <button
              type_="button"
              onClick={_ => setIsOpen(_ => false)}
              ariaLabel={c.close}
              title={c.close}
              className="modal-close modal-close--static">
              {React.string(`×`)}
            </button>
          </div>

          <div
            ref={ReactDOM.Ref.domRef(listRef)}
            role="log"
            ariaLive=#polite
            className="flex-1 space-y-2 overflow-y-auto px-q py-q">
            <div className="flex justify-start">
              <div className="chat-bubble"> {React.string(c.greeting)} </div>
            </div>
            {Array.length(messages) == 0
              ? <div className="flex flex-col items-start gap-1.5 pt-1">
                  {c.suggestions
                  ->Array.mapWithIndex((s, i) =>
                    <button
                      key={Int.toString(i)}
                      type_="button"
                      onClick={_ => submit(s)}
                      className="slip text-left">
                      {React.string(s)}
                    </button>
                  )
                  ->React.array}
                </div>
              : React.null}
            {messages->Array.map(bubble)->React.array}
            {busy && !streaming
              ? <p className="t-label" ariaLabel={c.thinking}> {React.string(c.thinking)} </p>
              : React.null}
          </div>

          <form
            onSubmit={e => {
              ReactEvent.Form.preventDefault(e)
              submit(input)
            }}
            className="flex shrink-0 items-center gap-2 border-t border-ink p-2">
            <input
              ref={ReactDOM.Ref.domRef(inputRef)}
              type_="text"
              value={input}
              onChange={e => {
                let value = ReactEvent.Form.target(e)["value"]
                setInput(_ => value)
              }}
              placeholder={c.placeholder}
              disabled={busy}
              className="min-w-0 flex-1 border border-rule bg-stock px-2 py-1.5 font-gothic text-sm text-ink focus:border-ink focus:outline-none disabled:opacity-60"
            />
            <button type_="submit" ariaLabel={c.send} disabled={!canSend} className="slip">
              {React.string(c.send)}
            </button>
          </form>
        </div>
      : React.null}
  </>
}
