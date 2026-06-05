// Fades/slides children into view the first time they enter the viewport.
// SSR-safe and progressive: when JS or IntersectionObserver is unavailable, or
// the user prefers reduced motion, content is shown immediately (the CSS only
// hides `.reveal` under `html.js`).
let observeReveal: (Dom.element, unit => unit) => (unit => unit) = %raw(`
  function (el, onShow) {
    if (typeof window === "undefined") {
      return function () {};
    }
    var reduce =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || typeof IntersectionObserver === "undefined") {
      onShow();
      return function () {};
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            onShow();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    observer.observe(el);
    return function () {
      observer.disconnect();
    };
  }
`)

let delayStyle: int => ReactDOM.Style.t = %raw(`
  function (ms) {
    return { "--reveal-delay": ms + "ms" };
  }
`)

@react.component
let make = (~delay=0, ~className="", ~children) => {
  let nodeRef = React.useRef(Nullable.null)
  let (visible, setVisible) = React.useState(() => false)

  React.useEffect0(() => {
    switch nodeRef.current->Nullable.toOption {
    | Some(el) => Some(observeReveal(el, () => setVisible(_ => true)))
    | None => None
    }
  })

  <div
    ref={ReactDOM.Ref.domRef(nodeRef)}
    className={"reveal " ++ (visible ? "is-visible " : "") ++ className}
    style={delayStyle(delay)}>
    {children}
  </div>
}
