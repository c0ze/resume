// Bindings to client/src/lib/voice.js — the construct's spoken replies, shared
// by the arda.tr family. That file is a verbatim copy of
// design-previews/onebit/voice.js (its header documents the protocol and the
// API); do not fork it here.
//
// Every function touches `window` only when called, so importing this module
// during the prerender is safe.

type speaker
// The body fields to spread into a /api/chat/stream request ({voice, lang}
// when voice is on, {} when muted) and a parsed SSE event. Both are opaque
// here: the transport passes them through untouched.
type fields
type event

type speakerOpts = {
  // How much of the raw reply may be shown (UTF-16 units); Infinity = all.
  onReveal: float => unit,
  // 0..1 loudness each frame while speaking.
  onLevel: float => unit,
  onEnd: unit => unit,
}

@module("./lib/voice.js") external unlockAudio: unit => unit = "unlockAudio"
@module("./lib/voice.js") external voiceEnabled: unit => bool = "voiceEnabled"
@module("./lib/voice.js") external setVoiceEnabled: bool => unit = "setVoiceEnabled"
@module("./lib/voice.js")
external onVoiceChange: (bool => unit) => (unit => unit) = "onVoiceChange"
@module("./lib/voice.js") external requestFields: string => fields = "requestFields"
@module("./lib/voice.js") external createSpeaker: speakerOpts => speaker = "createSpeaker"

@send external handle: (speaker, event) => unit = "handle"
@send external stop: speaker => unit = "stop"
