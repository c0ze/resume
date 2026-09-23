// Bindings to client/src/lib/onebit.js — the 1-bit engine shared by the
// arda.tr family. That file is a verbatim copy of
// design-previews/onebit/onebit.js; do not fork it here.
//
// Every animation pauses off-screen and in hidden tabs, and draws one still
// frame under prefers-reduced-motion. Colours are read from --ob-ink,
// --ob-ground and --ob-signal (emitted per rendition by generate-theme.mjs).
// A *still* canvas does not repaint by itself, so callers redraw on a
// rendition change.

type handle

@send external redraw: handle => unit = "redraw"
@send external destroy: handle => unit = "destroy"
@send external sizzle: (handle, float) => unit = "sizzle"

type treelineOpts = {seed: int, px: float, speed: float}
type orbOpts = {size: int, speed: float, seed: int}
type crackleOpts = {w: int, h: int}

@module("./lib/onebit.js")
external treeline: (Dom.element, treelineOpts) => handle = "treeline"
@module("./lib/onebit.js")
external orb: (Dom.element, orbOpts) => handle = "orb"
@module("./lib/onebit.js")
external crackle: (Dom.element, crackleOpts) => handle = "crackle"

// Mounts `make` on the canvas held by `ref` and tears it down on unmount.
// Returns the live handle through `into` so callers can sizzle/redraw it.
let useCanvas = (
  ref: React.ref<Nullable.t<Dom.element>>,
  make: Dom.element => handle,
  into: React.ref<option<handle>>,
) =>
  React.useEffect0(() =>
    switch ref.current->Nullable.toOption {
    | Some(canvas) =>
      let h = make(canvas)
      into.current = Some(h)
      Some(
        () => {
          into.current = None
          destroy(h)
        },
      )
    | None => None
    }
  )

let nextFrame: (unit => unit) => unit = %raw(`
  function (f) {
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(function () { f(); });
    else setTimeout(f, 0);
  }
`)

// Still canvases (reduced motion) keep the colours they were drawn in, so
// repaint whenever the rendition changes.
let useRepaintOnTheme = (into: React.ref<option<handle>>) => {
  let {theme} = ThemeContext.useTheme()
  React.useEffect1(() => {
    // The class lands on <html> in ThemeContext's own effect; wait a frame.
    nextFrame(() =>
      switch into.current {
      | Some(h) => redraw(h)
      | None => ()
      }
    )
    None
  }, [theme])
}
