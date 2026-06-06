// Floating "Ask about Arda" helpdesk widget. A launcher button opens a themed
// chat panel that POSTs to the ai.arda.tr bot's /api/chat (Gemini-backed; the
// server holds the key). Non-streaming v1. SSR-safe: the network call only runs
// in event handlers, and the panel only mounts on the client after a click.
// Requires the bot's CORS ALLOWED_ORIGINS to include this site's origin.
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

// Lets any other part of the page open the widget (Contact section / hero CTA)
// without sharing React state — a tiny window-event bus.
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
      className={"max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed " ++ (
        msg.role == "user"
          ? "whitespace-pre-wrap rounded-br-md bg-primary text-primary-foreground"
          : msg.isError
          ? "whitespace-pre-wrap rounded-bl-md border border-destructive/40 bg-destructive/10 text-foreground"
          : "rounded-bl-md bg-secondary text-foreground"
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

  let nextId = () => {
    let id = idRef.current
    idRef.current = id + 1
    id
  }

  // Keep the transcript pinned to the latest message / thinking indicator.
  // The key folds in the last message's length so streaming updates (same
  // message, growing content) keep the view scrolled to the bottom.
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

  // On open: focus the input and wire Escape-to-close.
  React.useEffect1(() => {
    if isOpen {
      switch inputRef.current->Nullable.toOption {
      | Some(el) => focusEl(el)
      | None => ()
      }
      Some(onEscape(() => setIsOpen(_ => false)))
    } else {
      None
    }
  }, [isOpen])

  // Open when another part of the page requests it (Contact section / hero CTA).
  React.useEffect0(() => Some(listenForOpen(() => setIsOpen(_ => true))))

  let submit = text => {
    let trimmed = String.trim(text)
    if trimmed !== "" && !busy {
      // Don't replay client-side error bubbles back to the model as history.
      let history = messages->Array.filter(m => !m.isError)
      let modelId = nextId()
      let started = ref(false)
      // Add the model bubble on the first token, then update it in place as more
      // tokens stream in.
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
            // A partial answer is already on screen — keep it, just stop busy.
            setStreaming(_ => false)
            setBusy(_ => false)
          } else {
            // Stream failed before any token — fall back to the non-streaming call.
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
      : <button
          type_="button"
          onClick={_ => setIsOpen(_ => true)}
          ariaLabel={c.launcher}
          className="no-print fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-primary px-0 text-primary-foreground shadow-glow transition-transform duration-200 hover:scale-105 sm:w-auto sm:px-5">
          <LucideReact.MessageCircle className="h-6 w-6 shrink-0" />
          <span className="hidden text-sm font-medium sm:inline"> {React.string(c.launcher)} </span>
        </button>}
    {isOpen
      ? <div
          role="dialog"
          ariaLabel={c.title}
          className="no-print fixed inset-x-3 bottom-3 z-40 mx-auto flex max-h-[80vh] max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-glow ring-1 ring-foreground/5 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[24rem]">
          <div
            className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-glow"
                ariaHidden=true>
                <LucideReact.Sparkles className="h-5 w-5" />
              </span>
              <div className="leading-tight">
                <p className="font-display text-sm font-bold text-foreground"> {React.string(c.title)} </p>
                <p className="flex items-center gap-1.5 font-mono text-[0.65rem] text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" ariaHidden=true />
                  {React.string("AI · Gemini")}
                </p>
              </div>
            </div>
            <button
              type_="button"
              onClick={_ => setIsOpen(_ => false)}
              ariaLabel={c.close}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
              <LucideReact.X className="h-4 w-4" />
            </button>
          </div>

          <div ref={ReactDOM.Ref.domRef(listRef)} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2 text-sm leading-relaxed text-foreground">
                {React.string(c.greeting)}
              </div>
            </div>
            {Array.length(messages) == 0
              ? <div className="flex flex-col items-start gap-2 pt-1">
                  {c.suggestions
                  ->Array.mapWithIndex((s, i) =>
                    <button
                      key={Int.toString(i)}
                      type_="button"
                      onClick={_ => submit(s)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-left text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                      {React.string(s)}
                    </button>
                  )
                  ->React.array}
                </div>
              : React.null}
            {messages->Array.map(bubble)->React.array}
            {busy && !streaming
              ? <div className="flex justify-start" ariaLabel={c.thinking}>
                  <div className="flex gap-1 rounded-2xl rounded-bl-md bg-secondary px-3.5 py-3">
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]"
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]"
                    />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              : React.null}
          </div>

          <form
            onSubmit={e => {
              ReactEvent.Form.preventDefault(e)
              submit(input)
            }}
            className="flex shrink-0 items-center gap-2 border-t border-border p-3">
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
              className="min-w-0 flex-1 rounded-full border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
            />
            <button
              type_="submit"
              ariaLabel={c.send}
              disabled={!canSend}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-200 hover:scale-105 disabled:opacity-40 disabled:hover:scale-100">
              <LucideReact.Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      : React.null}
  </>
}
