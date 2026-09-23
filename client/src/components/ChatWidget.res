// "Ask about Arda" — a floating chat panel that POSTs to the ai.arda.tr bot's
// SSE /api/chat/stream (falling back to the non-streaming /api/chat) and renders
// Markdown via Markdown.res (React elements only — never raw HTML). The bot
// holds the API key, so this static site ships no secrets. Other parts of the
// page open it via the `arda:open-chat` window event.
//
// Styled like ai.arda.tr: the construct orb revolves in the header and
// sizzles on every streamed chunk, and a crackling 1-bit block cursor trails
// the reply while it streams (OneBit.res / lib/onebit.js).
//
// Voice, as on ai.arda.tr (Voice.res / lib/voice.js): unless muted with the
// ♪ toggle in the header, a request asks for speech in the page's language,
// the reply is read aloud through the robot filter, its text is revealed only
// as far as the voice has got, and the orb sizzles with the loudness. A new
// question, closing the panel, a language switch or muting stops it.
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
// onError() if the stream fails (caller falls back only before any token).
// SSE shape: `data: {"type":"thinking"|"chunk"|"done","text"?}`.
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
  unit => unit,
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
    function onDeadline() { controller.abort(); fail(); }
    var timer = setTimeout(onDeadline, 45000);
    var settled = false;
    var reader;
    function closeReader() {
      if (reader) {
        try { Promise.resolve(reader.cancel()).catch(function () {}); } catch (e) {}
      }
    }
    function fail() {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      closeReader();
      onError();
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
        if (!res.ok || !res.body) { fail(); return; }
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
                fail();
                return;
              }
            }
            // EOF without completion is a failed request, even after partial text.
            if (r.done) { fail(); return; }
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


let now: unit => float = %raw(`function () { return Date.now(); }`)

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

// Mute / unmute the construct's voice. The label is constant for screen
// readers; `aria-pressed` carries the state. Below 600px the state word is
// dropped and the struck-through ♪ alone shows "muted".
module VoiceToggle = {
  @react.component
  let make = (~on: bool, ~c: Translations.chatContent) =>
    <button
      type_="button"
      onClick={_ => Voice.setVoiceEnabled(!on)}
      ariaPressed={on ? #"true" : #"false"}
      ariaLabel={c.voice}
      title={c.voice}
      className="chat__voice">
      <span className="chat__voice-glyph" ariaHidden=true> {React.string(`♪`)} </span>
      <span className="chat__voice-word" ariaHidden=true>
        {React.string(" " ++ (on ? c.voiceOn : c.voiceOff))}
      </span>
    </button>
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
  let orbRef = React.useRef(None)
  // The reply being spoken: Some((messageId, revealed)) while its voice gates
  // the text. `speakerRef` holds the live speaker with a token, so callbacks
  // from a speaker that has since been replaced or stopped are dropped.
  let (speech, setSpeech) = React.useState(() => None)
  let (voiceOn, setVoiceOn) = React.useState(() => true)
  let speakerRef = React.useRef(None)
  let speakerToken = React.useRef(0)
  let lastLevelAt = React.useRef(0.0)

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

  // Silence the current reply and show all of it.
  let stopSpeech = () => {
    speakerToken.current = speakerToken.current + 1
    let current = speakerRef.current
    speakerRef.current = None
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
      onLevel: level => {
        // Sizzle at ~9 Hz scaled by loudness: the orb's heat tracks the voice.
        let t = now()
        if live() && level >= 0.03 && t -. lastLevelAt.current >= 110.0 {
          lastLevelAt.current = t
          sizzle(level *. 0.6)
        }
      },
      onEnd: () =>
        if live() {
          speakerRef.current = None
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

  // Keep the transcript pinned to the latest message / thinking indicator.
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
    | Some(el) => scrollToBottom(el)
    | None => ()
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
      setBusy(_ => true)
      setStreaming(_ => false)
      sizzle(0.4)
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
          sizzle(0.5 +. Math.random() *. 0.5)
        },
        full => {
          addOrUpdate(full)
          setStreaming(_ => false)
          setBusy(_ => false)
        },
        () => {
          stopSpeech()
          if started.contents {
            let errorId = nextId()
            setMessages(prev =>
              Array.concat(prev, [{id: errorId, role: "model", content: c.error, isError: true}])
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
        Voice.requestFields(Translations.languageToString(language)),
        event => Voice.handle(speaker, event),
      )
    }
  }

  let canSend = String.trim(input) !== "" && !busy
  let lastId = switch messages->Array.get(Array.length(messages) - 1) {
  | Some(m) => m.id
  | None => -1
  }

  // Below 900px the launcher shows only its `?` mark; the label stays its name.
  <>
    {isOpen
      ? React.null
      : <button
          ref={ReactDOM.Ref.domRef(launcherRef)}
          type_="button"
          onClick={_ => setIsOpen(_ => true)}
          ariaHaspopup=#dialog
          className="chat-launcher no-print">
          <span className="chat-launcher__mark" ariaHidden=true> {React.string("?")} </span>
          <span className="chat-launcher__label"> {React.string(c.launcher)} </span>
          <span className="chat-launcher__arrow" ariaHidden=true> {React.string(` ▸`)} </span>
        </button>}
    {isOpen
      ? <div role="dialog" ariaLabelledby="chat-title" className="chat no-print">
          <div className="chat__head">
            <Orb into=orbRef />
            <div className="chat__id">
              <h2 id="chat-title" className="chat__title"> {React.string(c.title)} </h2>
              <p className="chat__sub"> {React.string("ai.arda.tr")} </p>
            </div>
            <VoiceToggle on=voiceOn c />
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
            ->Array.map(m => {
              // While spoken, a reply shows only as far as the voice has got,
              // and keeps its cursor until the voice is done.
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
                ~live=(streaming && m.id == lastId) || spoken != None,
              )
            })
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
