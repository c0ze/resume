// Accessible modal dialog rendered through a portal to <body>, so it escapes the
// sliding rail's overflow/transform context. Renders nothing when closed.
// While open it: locks body scroll, marks the app root `inert` + aria-hidden
// (background can't be interacted with or tabbed into), traps Tab/Shift+Tab
// inside the dialog, closes on Escape / backdrop / the close button, and
// restores focus to the element that opened it. Excluded from print.
let getBody: unit => Nullable.t<Dom.element> = %raw(`
  function () {
    return typeof document !== "undefined" ? document.body : null;
  }
`)

// Wires the dialog (given its panel element) and returns a teardown.
let setupModal: (Dom.element, unit => unit) => (unit => unit) = %raw(`
  function (panel, close) {
    var prevFocus = document.activeElement;
    var root = document.getElementById("root");
    if (root) {
      root.setAttribute("inert", "");
      root.setAttribute("aria-hidden", "true");
    }
    var prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function focusables() {
      return Array.prototype.slice.call(
        panel.querySelectorAll(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        )
      );
    }

    // Move focus into the dialog (the panel itself is tabindex=-1).
    panel.focus();

    function onKey(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      var list = focusables();
      if (!list.length) {
        e.preventDefault();
        panel.focus();
        return;
      }
      var first = list[0];
      var last = list[list.length - 1];
      var idx = list.indexOf(document.activeElement);
      if (e.shiftKey) {
        if (idx <= 0) {
          e.preventDefault();
          last.focus();
        }
      } else if (idx === -1 || idx === list.length - 1) {
        e.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", onKey, true);

    return function () {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = prevOverflow;
      if (root) {
        root.removeAttribute("inert");
        root.removeAttribute("aria-hidden");
      }
      if (prevFocus && typeof prevFocus.focus === "function") {
        prevFocus.focus();
      }
    };
  }
`)

@react.component
let make = (~isOpen, ~onClose, ~labelledBy=?, ~closeLabel="Close", ~children) => {
  let panelRef = React.useRef(Nullable.null)

  React.useEffect1(() => {
    if isOpen {
      switch panelRef.current->Nullable.toOption {
      | Some(panel) => Some(setupModal(panel, onClose))
      | None => None
      }
    } else {
      None
    }
  }, [isOpen])

  if !isOpen {
    React.null
  } else {
    switch getBody()->Nullable.toOption {
    | None => React.null
    | Some(body) =>
      ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6 print:hidden">
          <div
            className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            ariaHidden=true
            onClick={_ => onClose()}
          />
          <div
            ref={ReactDOM.Ref.domRef(panelRef)}
            role="dialog"
            ariaModal=true
            ariaLabelledby=?labelledBy
            tabIndex={-1}
            className="relative z-10 flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-glow ring-1 ring-foreground/5 focus:outline-none sm:rounded-2xl">
            <button
              type_="button"
              onClick={_ => onClose()}
              ariaLabel=closeLabel
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-primary">
              <LucideReact.X className="h-4 w-4" />
            </button>
            {children}
          </div>
        </div>,
        body,
      )
    }
  }
}
