// "Ask about Arda": a floating chat panel that POSTs to the ai.arda.tr bot's
// SSE /api/chat/stream (falling back to the non-streaming /api/chat) and renders
// Markdown via Markdown.res (React elements only, never raw HTML). The bot
// holds the API key, so this static site ships no secrets. Other parts of the
// page open it via the `arda:open-chat` window event.
//
// Styled with the family's patterns (brand.css): the assistant is the ember
// (`.ix-mark`, drawn from `--ix-ember-art`, set in index.css), which glows
// while a reply is on its way; its replies sit left beside it with no bubble,
// the visitor's questions right on the surface colour (`.ix-thread`,
// `.ix-msg`). The suggested questions are chips (`.ix-chip`).
//
// Voice, as on ai.arda.tr (Voice.res / lib/voice.js): unless the "read replies
// aloud" switch is off, a request asks for speech in the page's language, the
// reply is read aloud through the robot filter, its text is revealed only as
// far as the voice has got, and the reply's ember glows with the loudness
// (`--ix-level`). A new question, closing the panel, a language switch or
// muting stops it.
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
      .then(function (r) {
        if (!r.ok) throw new Error("Chat request failed");
        return r.json();
      })
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
// onError(retryable) if the stream fails.
// SSE shape: `data: {"type":"thinking"|"chunk"|"done","text"?}`.
//
// `retryable` says whether the non-streaming /api/chat is worth asking: a
// second request costs the bot a second reply and the visitor a second
// rate-limit slot, so only when the stream never got an answer from the bot:
// a network error, a deadline or a closed connection before any byte, HTTP
// 413 (the stream body was refused for its size) or a 5xx. Any other 4xx
// (429 rate limit, 400/403/415 refusals) and an SSE `error` event are the
// bot's answer, and so is any failure after the first byte.
//
// Voice: `extra` is spread into the body (Voice.requestFields: {voice, lang},
// or {} when muted), and onEvent receives EVERY parsed event object, speech
// ones included, before the transport acts on it, so the reply's speaker sees
// `done` and `error` too. With voice the server holds `done` back until the
// speech is sent, so the 45s deadline is an idle one: every read re-arms it.
let postChatStream: (
  string,
  array<chatMsg>,
  string => unit,
  string => unit,
  bool => unit,
  Voice.fields,
  Voice.event => unit,
) => unit = %raw(`
  function (message, history, onChunk, onDone, onError, extra, onEvent) {
    var hist = (history || []).map(function (m) {
      return { role: m.role, content: m.content };
    });
    var body = { message: message, history: hist };
    if (extra && typeof extra === "object") {
      for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key) && !(key in body)) body[key] = extra[key];
      }
    }
    var controller = new AbortController();
    var gotBytes = false;
    function onDeadline() { controller.abort(); fail(!gotBytes); }
    var timer = setTimeout(onDeadline, 45000);
    var settled = false;
    var reader;
    function closeReader() {
      if (reader) {
        try { Promise.resolve(reader.cancel()).catch(function () {}); } catch (e) {}
      }
    }
    function fail(retryable) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      closeReader();
      onError(retryable === true);
    }
    function finish(full) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      closeReader();
      onDone(full);
    }
    fetch("https://ai-arda-tr-api-599610058688.asia-northeast1.run.app/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "text/event-stream" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
      .then(function (res) {
        if (!res.ok) { fail(res.status === 413 || res.status >= 500); return; }
        if (!res.body) { fail(true); return; }
        reader = res.body.getReader();
        if (settled) { closeReader(); return; }
        var decoder = new TextDecoder();
        var buffer = "";
        var full = "";
        function pump() {
          return reader.read().then(function (r) {
            if (settled) return;
            if (r.done) {
              buffer += decoder.decode(); // flush any trailing multi-byte char
            } else {
              gotBytes = true;
              clearTimeout(timer);
              timer = setTimeout(onDeadline, 45000);
              buffer += decoder.decode(r.value, { stream: true });
            }
            // SSE events are blank-line separated; tolerate LF or CRLF framing.
            var events = buffer.split(/\r?\n\r?\n/);
            buffer = events.pop() || ""; // incomplete events are never dispatched
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
              if (!obj || typeof obj !== "object") continue;
              if (typeof onEvent === "function") {
                try { onEvent(obj); } catch (e) {}
              }
              if (obj.type === "chunk" && typeof obj.text === "string" && obj.text.length > 0) {
                full += obj.text;
                onChunk(full);
              } else if (obj.type === "done" && typeof obj.text === "string" && obj.text.length > 0) {
                full = obj.text;
                finish(full);
                return;
              } else if (obj.type === "error") {
                fail(false);
                return;
              }
            }
            // EOF without completion is a failed request, even after partial
            // text; a connection closed before any byte is a network failure.
            if (r.done) { fail(!gotBytes); return; }
            return pump();
          });
        }
        return pump();
      })
      .catch(function () { fail(!gotBytes); });
  }
`)

let scrollToBottom: Dom.element => unit = %raw(`function (el) { if (el) el.scrollTop = el.scrollHeight; }`)
// Whether the log is scrolled to (within 40px of) its end.
let nearBottom: Dom.element => bool = %raw(`
  function (el) { return !el || el.scrollHeight - el.scrollTop - el.clientHeight <= 40; }
`)
let focusEl: Dom.element => unit = %raw(`function (el) { if (el) el.focus(); }`)

// An Escape something else already handled (the certificate dialog over the
// chat calls preventDefault in its capture listener) is not the chat's: one
// key press closes one layer, and the dialog returns focus to its opener.
let onEscape: (unit => unit) => unit => unit = %raw(`
  function (close) {
    function onKey(e) { if (e.key === "Escape" && !e.defaultPrevented) close(); }
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

let listenForOpen: (unit => unit) => unit => unit = %raw(`
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

// The assistant's mark: the ember. `busy` makes it glow while a reply is on
// its way; `ref` lets the voice drive `--ix-level` on the reply being spoken.
let mark = (~busy=false, ~ref=?, ()) =>
  React.cloneElement(
    <span className="ix-mark" ariaHidden=true ?ref />,
    {"data-busy": busy ? "true" : "false"},
  )

// The loudness (0..1) of the voice, written straight to the mark: it changes
// every frame, so it does not go through React state.
let setLevel: (Nullable.t<Dom.element>, float) => unit = %raw(`
  function (el, level) {
    if (!el) return;
    if (level > 0) el.style.setProperty("--ix-level", String(level));
    else el.style.removeProperty("--ix-level");
  }
`)

// `who` names the speaker for screen readers; on screen the ember and the
// surface-coloured box tell the two apart.
let message = (~who, ~msg: chatMsg, ~markRef=?, ()) => {
  let speaker = <span className="ix-sr"> {React.string(`${who}: `)} </span>
  msg.role == "user"
    ? <div key={Int.toString(msg.id)} className="ix-msg ix-msg--you">
        {speaker}
        <p className="chat__plain"> {React.string(msg.content)} </p>
      </div>
    : <div key={Int.toString(msg.id)} className={msg.isError ? "ix-msg chat__err" : "ix-msg"}>
        {mark(~ref=?markRef, ())}
        <div className="ix-msg__body">
          {speaker}
          {msg.isError
            ? <p className="chat__plain"> {React.string(msg.content)} </p>
            : <Markdown text={msg.content} />}
        </div>
      </div>
}

@react.component
let make = () => {
  let {translations: t, language} = LanguageContext.useLanguage()
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
  // Whether new text should keep the log pinned to its end: true while the
  // reader is at the end, false once they scroll up to read.
  let followRef = React.useRef(true)
  // The mark of the reply being spoken, for the voice's loudness.
  let liveMarkRef = React.useRef(Nullable.null)
  // The reply being spoken: Some((messageId, revealed)) while its voice gates
  // the text. `speakerRef` holds the live speaker with a token, so callbacks
  // from a speaker that has since been replaced or stopped are dropped.
  let (speech, setSpeech) = React.useState(() => None)
  let (voiceOn, setVoiceOn) = React.useState(() => true)
  let speakerRef = React.useRef(None)
  let speakerToken = React.useRef(0)

  let nextId = () => {
    let id = idRef.current
    idRef.current = id + 1
    id
  }

  // Silence the current reply and show all of it.
  let stopSpeech = () => {
    speakerToken.current = speakerToken.current + 1
    let current = speakerRef.current
    speakerRef.current = None
    setLevel(liveMarkRef.current, 0.)
    setSpeech(_ => None)
    switch current {
    | Some(s) => Voice.stop(s)
    | None => ()
    }
  }

  // One speaker per reply. Created for every reply: when muted (or the
  // server says voice off) it reveals everything at the first chunk, exactly
  // like the text-only widget.
  let startSpeech = modelId => {
    stopSpeech()
    let token = speakerToken.current
    let live = () => speakerToken.current == token
    let s = Voice.createSpeaker({
      onReveal: n =>
        if live() {
          setSpeech(_ => n == Float.Constants.positiveInfinity ? None : Some((modelId, n)))
        },
      onLevel: level =>
        if live() {
          setLevel(liveMarkRef.current, level)
        },
      onEnd: () =>
        if live() {
          speakerRef.current = None
          setLevel(liveMarkRef.current, 0.)
          setSpeech(_ => None)
        },
    })
    speakerRef.current = Some(s)
    s
  }

  // The visitor's mute choice lives in voice.js (localStorage "voice"); read
  // it after hydration and follow every change.
  React.useEffect0(() => {
    setVoiceOn(_ => Voice.voiceEnabled())
    Some(Voice.onVoiceChange(on => setVoiceOn(_ => on)))
  })

  // A language switch stops the voice mid-sentence.
  React.useEffect1(() => {
    stopSpeech()
    None
  }, [language])

  // Keep the transcript pinned to the latest message / thinking indicator,
  // but only while the reader is at the end (or has just asked): a streamed
  // chunk must not pull someone reading an earlier answer back down.
  let lastLen = switch messages->Array.get(Array.length(messages) - 1) {
  | Some(m) => String.length(m.content)
  | None => 0
  }
  let shownKey = switch speech {
  | Some((_, n)) => Float.toString(n)
  | None => "-"
  }
  React.useEffect1(() => {
    switch listRef.current->Nullable.toOption {
    | Some(el) if followRef.current => scrollToBottom(el)
    | _ => ()
    }
    None
  }, [
    Int.toString(Array.length(messages)) ++
    ":" ++
    Int.toString(lastLen) ++
    ":" ++
    shownKey ++
    ":" ++ (busy ? "1" : "0"),
  ])

  // On open: remember what had focus, focus the input and wire
  // Escape-to-close. On close, the cleanup returns focus to where the reader
  // was (the contact button) or to the launcher, so keyboard users aren't
  // stranded. The panel is non-modal (the page stays usable behind it), so
  // focus is restored rather than trapped.
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
          // Closing (× or Escape) silences the reply.
          stopSpeech()
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

  // A panel opens at the end of its log: reopened on a finished
  // conversation, the newly mounted log would otherwise start at the top.
  React.useEffect1(() => {
    if isOpen {
      followRef.current = true
      switch listRef.current->Nullable.toOption {
      | Some(el) => scrollToBottom(el)
      | None => ()
      }
    }
    None
  }, [isOpen])

  let submit = text => {
    let trimmed = String.trim(text)
    if trimmed !== "" && !busy {
      // Don't replay client-side error bubbles back to the model as history.
      let history = messages->Array.filter(m => !m.isError)
      let modelId = nextId()
      let started = ref(false)
      let addOrUpdate = full => {
        started := true
        setMessages(prev =>
          if prev->Array.some(m => m.id == modelId) {
            prev->Array.map(m => m.id == modelId ? {...m, content: full} : m)
          } else {
            Array.concat(prev, [{id: modelId, role: "model", content: full, isError: false}])
          }
        )
      }
      let userId = nextId()
      setMessages(prev =>
        Array.concat(prev, [{id: userId, role: "user", content: trimmed, isError: false}])
      )
      setInput(_ => "")

      // The visitor's own question brings the log back to its end.
      followRef.current = true
      setBusy(_ => true)
      setStreaming(_ => false)

      // Inside the send gesture (Enter, the send button, a quick prompt), or
      // the browser keeps the audio muted. A new question interrupts the
      // previous reply's voice.
      if Voice.voiceEnabled() {
        Voice.unlockAudio()
      }
      let speaker = startSpeech(modelId)
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
        retryable => {
          stopSpeech()
          if started.contents {
            let errorId = nextId()
            setMessages(prev =>
              Array.concat(prev, [{id: errorId, role: "model", content: c.error, isError: true}])
            )
            setStreaming(_ => false)
            setBusy(_ => false)
          } else if !retryable {
            // The bot refused or failed the request itself (a rate limit, a
            // blocked question): asking /api/chat would only repeat that.
            setMessages(prev =>
              Array.concat(prev, [{id: modelId, role: "model", content: c.error, isError: true}])
            )
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
                  Array.concat(
                    prev,
                    [{id: modelId, role: "model", content: c.error, isError: true}],
                  )
                )
                setBusy(_ => false)
              },
            )
          }
        },
        Voice.requestFields(Translations.languageToString(language)),
        event => Voice.handle(speaker, event),
      )
    }
  }

  let focusInput = () =>
    switch inputRef.current->Nullable.toOption {
    | Some(el) => focusEl(el)
    | None => ()
    }

  let canSend = String.trim(input) !== "" && !busy

  <>
    {isOpen
      ? React.null
      : <Astryx.Button
          ref={ReactDOM.Ref.domRef(launcherRef)}
          label={c.launcher}
          icon={<span className="ix-mark ix-mark--sm" ariaHidden=true />}
          onClick={_ => setIsOpen(_ => true)}
          ariaHaspopup="dialog"
          className="chat-launcher no-print"
        />}
    {isOpen
      ? <div role="dialog" ariaLabelledby="chat-title" className="chat no-print">
          <div className="chat__head">
            <div className="chat__id">
              <Astryx.Text as_=#h2 weight=#semibold id="chat-title">
                {React.string(c.title)}
              </Astryx.Text>
              // A host name: lang="en" keeps its capitals plain under lang="tr".
              <p className="ix-label" lang="en"> {React.string("ai.arda.tr")} </p>
            </div>
            <Astryx.IconButton
              label={c.close}
              icon={<Astryx.Icon icon=#close />}
              variant=#ghost
              size=#sm
              onClick={_ => setIsOpen(_ => false)}
            />
          </div>
          <div
            ref={ReactDOM.Ref.domRef(listRef)}
            role="log"
            ariaLive=#polite
            className="chat__log ix-thread"
            onScroll={e =>
              followRef.current = nearBottom(ReactEvent.UI.currentTarget(e)->Obj.magic)}>
            <div className="ix-msg">
              {mark()}
              <div className="ix-msg__body">
                <span className="ix-sr"> {React.string(`${r.assistant}: `)} </span>
                <p> {React.string(c.greeting)} </p>
              </div>
            </div>
            {messages
            ->Array.map(m => {
              // While spoken, a reply shows only as far as the voice has got,
              // and its mark follows the voice's loudness.
              let spoken = switch speech {
              | Some((id, n)) if id == m.id => Some(n)
              | _ => None
              }
              message(
                ~who=m.role == "user" ? r.you : r.assistant,
                ~msg=switch spoken {
                | Some(n) => {...m, content: Markdown.revealPrefix(m.content, n)}
                | None => m
                },
                ~markRef=?{spoken == None ? None : Some(ReactDOM.Ref.domRef(liveMarkRef))},
                (),
              )
            })
            ->React.array}
            {busy && !streaming
              ? <div className="ix-msg">
                  {mark(~busy=true, ())}
                  <div className="ix-msg__body">
                    <p className="ix-muted"> {React.string(c.thinking)} </p>
                  </div>
                </div>
              : React.null}
          </div>
          {Array.length(messages) == 0
            ? <div className="ix-chips chat__prompts">
                {c.suggestions
                ->Array.mapWithIndex((s, i) =>
                  <button
                    key={Int.toString(i)}
                    type_="button"
                    className="ix-chip"
                    onClick={_ => {
                      submit(s)
                      // The prompts unmount once a message exists; keep the
                      // keyboard in the input rather than dropping it on <body>.
                      focusInput()
                    }}>
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
              // The send button is disabled the moment the input clears; if
              // it had focus (a click, or Tab then Enter), focus would drop to
              // <body>. Keep the keyboard in the input, as Enter does.
              focusInput()
            }}
            className="chat__form">
            <input
              ref={ReactDOM.Ref.domRef(inputRef)}
              type_="text"
              maxLength=20000
              className="ix-input"
              value={input}
              onChange={e => {
                let value = ReactEvent.Form.target(e)["value"]
                setInput(_ => value)
              }}
              placeholder={c.placeholder}
              ariaLabel={c.placeholder}
              // Read-only, not disabled, while a reply is on its way: disabling
              // the focused input sends focus to <body>, and the reader would
              // have to click back in after every question. Submitting is
              // blocked by `busy` in submit() and by the send button.
              readOnly={busy}
            />
            <Astryx.Button label={c.send} variant=#primary type_=#submit isDisabled={!canSend} />
          </form>
          <div className="chat__foot">
            <Astryx.Switch
              label={c.voice} value=voiceOn size=#sm onChange={on => Voice.setVoiceEnabled(on)}
            />
          </div>
        </div>
      : React.null}
  </>
}
