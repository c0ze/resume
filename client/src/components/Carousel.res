// Horizontal sliding rail. Native CSS scroll-snap drives touch + trackpad; a
// pointer drag handler adds click-and-drag for mouse users; arrow buttons jump
// ~one viewport and disable at the ends. In print the rail unrolls into a
// stacked list (see index.css). Children are passed already-rendered as `items`.

let edgeState: Dom.element => (bool, bool) = %raw(`
  function (el) {
    var max = el.scrollWidth - el.clientWidth;
    var atStart = el.scrollLeft <= 2;
    var atEnd = max <= 2 || el.scrollLeft >= max - 2;
    return [atStart, atEnd];
  }
`)

let scrollRail: (Dom.element, float) => unit = %raw(`
  function (el, factor) {
    el.scrollBy({ left: el.clientWidth * factor, behavior: "smooth" });
  }
`)

// Wires drag-to-scroll + a scroll/resize listener; returns its teardown.
let setupRail: (Dom.element, unit => unit) => (unit => unit) = %raw(`
  function (el, onScroll) {
    var isDown = false, startX = 0, startScroll = 0, moved = false;
    function down(e) {
      isDown = true;
      moved = false;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.classList.add("is-dragging");
    }
    function move(e) {
      if (!isDown) return;
      var dx = e.pageX - startX;
      if (Math.abs(dx) > 4) moved = true;
      el.scrollLeft = startScroll - dx;
    }
    function up() {
      if (!isDown) return;
      isDown = false;
      el.classList.remove("is-dragging");
    }
    // Swallow the click that ends a drag so cards aren't accidentally opened.
    function onClick(e) {
      if (moved) {
        e.preventDefault();
        e.stopPropagation();
        moved = false;
      }
    }
    el.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    el.addEventListener("click", onClick, true);
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return function () {
      el.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      el.removeEventListener("click", onClick, true);
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }
`)

let arrowClass = "flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:text-primary disabled:cursor-default disabled:opacity-25 disabled:shadow-none disabled:hover:translate-y-0 disabled:hover:border-border disabled:hover:text-foreground"

@react.component
let make = (~ariaLabel, ~itemClassName="w-[85%] sm:w-[24rem]", ~stretch=true, ~items) => {
  let containerRef = React.useRef(Nullable.null)
  let (atStart, setAtStart) = React.useState(() => true)
  let (atEnd, setAtEnd) = React.useState(() => false)

  let refresh = () =>
    switch containerRef.current->Nullable.toOption {
    | Some(el) =>
      let (s, e) = edgeState(el)
      setAtStart(_ => s)
      setAtEnd(_ => e)
    | None => ()
    }

  React.useEffect0(() =>
    switch containerRef.current->Nullable.toOption {
    | Some(el) =>
      let teardown = setupRail(el, refresh)
      refresh()
      Some(teardown)
    | None => None
    }
  )

  let go = factor =>
    switch containerRef.current->Nullable.toOption {
    | Some(el) => scrollRail(el, factor)
    | None => ()
    }

  <div className="relative">
    <div className="rail-controls mb-5 flex items-center justify-end gap-2">
      <button
        type_="button"
        className=arrowClass
        ariaLabel="Scroll backward"
        disabled=atStart
        onClick={_ => go(-0.85)}>
        <LucideReact.ArrowLeft className="h-4 w-4" />
      </button>
      <button
        type_="button"
        className=arrowClass
        ariaLabel="Scroll forward"
        disabled=atEnd
        onClick={_ => go(0.85)}>
        <LucideReact.ArrowRight className="h-4 w-4" />
      </button>
    </div>

    <div
      ref={ReactDOM.Ref.domRef(containerRef)}
      role="region"
      ariaLabel
      tabIndex=0
      className={"rail-scroll mask-fade-x flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto px-1 pb-5 pt-1 focus:outline-none focus-visible:outline-none " ++ (
        stretch ? "items-stretch" : "items-start"
      )}>
      {items
      ->Array.mapWithIndex((item, i) =>
        <div key={Int.toString(i)} className={"snap-start shrink-0 " ++ itemClassName}>
          {item}
        </div>
      )
      ->React.array}
    </div>
  </div>
}
