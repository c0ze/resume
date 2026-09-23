// The family signature: a strip of 1-bit spruces under the status bar,
// drifting at about 4px/s. The only thing on the résumé that moves. It pauses
// off-screen and in hidden tabs, and is a still frame under reduced motion
// (onebit.js handles all three). Decorative.

@react.component
let make = () => {
  let canvasRef = React.useRef(Nullable.null)
  let handle = React.useRef(None)

  OneBit.useCanvas(canvasRef, c => OneBit.treeline(c, {seed: 3, px: 2., speed: 4.}), handle)
  OneBit.useRepaintOnTheme(handle)

  <canvas className="px treeline no-print" ariaHidden=true ref={ReactDOM.Ref.domRef(canvasRef)} />
}
