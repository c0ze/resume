// "Ask about Arda" — a floating chat panel that POSTs to the ai.arda.tr bot's
// SSE /api/chat/stream (falling back to the non-streaming /api/chat) and renders
// Markdown via Markdown.res (React elements only — never raw HTML). The bot
// holds the API key, so this static site ships no secrets. Other parts of the
// page open it via the `arda:open-chat` window event.
//
// Styled like ai.arda.tr: the construct orb revolves in the header and
// sizzles on every streamed chunk, and a crackling 1-bit block cursor trails
// the reply while it streams (OneBit.res / lib/onebit.js).
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


let activeElement: unit => Nullable.t<Dom.element> = %raw(`
  function () {
    var el = typeof document !== "undefined" ? document.activeElement : null;
    return el && el !== document.body ? el : null;
  }
`)

// The construct: a small revolving 1-bit planet. Its handle is handed back
// through `into` so the widget can sizzle it per chunk.
module Orb = {
  @react.component
  let make = (~into: React.ref<option<OneBit.handle>>) => {
    let canvasRef = React.useRef(Nullable.null)
    OneBit.useCanvas(canvasRef, c => OneBit.orb(c, {size: 40, speed: 0.55, seed: 7}), into)
    OneBit.useRepaintOnTheme(into)
    <canvas className="px chat__orb" ariaHidden=true ref={ReactDOM.Ref.domRef(canvasRef)} />
  }
}

// The crackling block cursor at the end of a streaming reply.
module Cursor = {
  @react.component
  let make = () => {
    let canvasRef = React.useRef(Nullable.null)
    let handle = React.useRef(None)
    OneBit.useCanvas(canvasRef, c => OneBit.crackle(c, {w: 5, h: 9}), handle)
    <canvas className="px chat__cursor" ariaHidden=true ref={ReactDOM.Ref.domRef(canvasRef)} />
  }
}

let message = (~who, ~msg: chatMsg, ~live) => {
  let isModel = msg.role != "user" && !msg.isError
  let cls =
    "msg" ++ (msg.role == "user" ? " msg--you" : msg.isError ? " msg--err" : " msg--ai")
  <div key={Int.toString(msg.id)} className=cls>
    <p className="msg__who"> {React.string(who ++ ` ▸`)} </p>
    <div className="msg__txt">
      {isModel
        ? <Markdown text={msg.content} after=?{live ? Some(<Cursor />) : None} />
        : <p className="whitespace-pre-wrap"> {React.string(msg.content)} </p>}
    </div>
  </div>
}

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let c = t.chat
  let r = t.record
  let (isOpen, setIsOpen) = React.useState(() => false)
  let (input, setInput) = React.useState(() => "")
  let (messages, setMessages) = React.useState(() => [])
  let (busy, setBusy) = React.useState(() => false)
  let (streaming, setStreaming) = React.useState(() => false)
  let idRef = React.useRef(0)
  let listRef = React.useRef(Nullable.null)
  let inputRef = React.useRef(Nullable.null)
  let launcherRef = React.useRef(Nullable.null)
  let returnRef = React.useRef(Nullable.null)
  let orbRef = React.useRef(None)

  let nextId = () => {
    let id = idRef.current
    idRef.current = id + 1
    id
  }

  let sizzle = amount =>
    switch orbRef.current {
    | Some(h) => OneBit.sizzle(h, amount)
    | None => ()
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

  // On open: remember what had focus, focus the input and wire
  // Escape-to-close. On close, the cleanup returns focus to where the reader
  // was (the rail's "Ask", the contact button) or to the launcher, so keyboard
  // users aren't stranded. The panel is non-modal — the page stays usable
  // behind it — so focus is restored rather than trapped.
  React.useEffect1(() => {
    if isOpen {
      returnRef.current = activeElement()
      switch inputRef.current->Nullable.toOption {
      | Some(el) => focusEl(el)
      | None => ()
      }
      let removeEscape = onEscape(() => setIsOpen(_ => false))
      Some(
        () => {
          removeEscape()
          let back = switch returnRef.current->Nullable.toOption {
          | Some(el) => Some(el)
          | None => launcherRef.current->Nullable.toOption
          }
          switch back {
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
      sizzle(0.4)
      postChatStream(
        trimmed,
        history,
        full => {
          if !started.contents {
            setStreaming(_ => true)
          }
          addOrUpdate(full)
          sizzle(0.5 +. Math.random() *. 0.5)
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
                sizzle(1.0)
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
  let lastId = switch messages->Array.get(Array.length(messages) - 1) {
  | Some(m) => m.id
  | None => -1
  }

  <>
    {isOpen
      ? React.null
      : <button
          ref={ReactDOM.Ref.domRef(launcherRef)}
          type_="button"
          onClick={_ => setIsOpen(_ => true)}
          ariaHaspopup=#dialog
          className="chat-launcher no-print">
          {React.string(c.launcher)}
          <span ariaHidden=true> {React.string(` ▸`)} </span>
        </button>}
    {isOpen
      ? <div role="dialog" ariaLabelledby="chat-title" className="chat no-print">
          <div className="chat__head">
            <Orb into=orbRef />
            <div className="chat__id">
              <h2 id="chat-title" className="chat__title"> {React.string(c.title)} </h2>
              <p className="chat__sub"> {React.string("ai.arda.tr")} </p>
            </div>
            <button
              type_="button"
              onClick={_ => setIsOpen(_ => false)}
              ariaLabel={c.close}
              title={c.close}
              className="x">
              {React.string(`×`)}
            </button>
          </div>

          <div ref={ReactDOM.Ref.domRef(listRef)} role="log" ariaLive=#polite className="chat__log">
            <div className="msg msg--ai">
              <p className="msg__who"> {React.string(r.assistant ++ ` ▸`)} </p>
              <div className="msg__txt"> <p> {React.string(c.greeting)} </p> </div>
            </div>
            {messages
            ->Array.map(m =>
              message(
                ~who=m.role == "user" ? r.you : r.assistant,
                ~msg=m,
                ~live=streaming && m.id == lastId,
              )
            )
            ->React.array}
            {busy && !streaming
              ? <div className="msg msg--ai msg--wait">
                  <p className="msg__who"> {React.string(r.assistant ++ ` ▸`)} </p>
                  <p className="msg__txt"> {React.string(c.thinking)} <Cursor /> </p>
                </div>
              : React.null}
          </div>

          {Array.length(messages) == 0
            ? <div className="chat__prompts">
                {c.suggestions
                ->Array.mapWithIndex((s, i) =>
                  <button key={Int.toString(i)} type_="button" onClick={_ => submit(s)}>
                    <em ariaHidden=true> {React.string(Int.toString(i + 1))} </em>
                    {React.string(s)}
                  </button>
                )
                ->React.array}
              </div>
            : React.null}

          <form
            onSubmit={e => {
              ReactEvent.Form.preventDefault(e)
              submit(input)
            }}
            className="chat__form">
            <span className="chat__prompt" ariaHidden=true> {React.string(`▸`)} </span>
            <input
              ref={ReactDOM.Ref.domRef(inputRef)}
              type_="text"
              value={input}
              onChange={e => {
                let value = ReactEvent.Form.target(e)["value"]
                setInput(_ => value)
              }}
              placeholder={c.placeholder}
              ariaLabel={c.placeholder}
              disabled={busy}
            />
            <button type_="submit" ariaLabel={c.send} disabled={!canSend} className="chat__send">
              {React.string(c.send)}
              <span ariaHidden=true> {React.string(` ↵`)} </span>
            </button>
          </form>
        </div>
      : React.null}
  </>
}
