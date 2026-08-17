// Section navigation: the rail's job on desktop, a sticky scrolling bar on
// narrow screens.
//
// Plain anchors, so it works with JavaScript off and every link is a real
// destination. Two behaviours are layered on top and both degrade to nothing:
//
//  - Following a link opens the section it points at. Without this, navigating
//    to a collapsed section scrolls you to a shut row, which reads as a broken
//    link rather than as a closed section.
//  - The current section is marked while scrolling, via IntersectionObserver.

// Opens the <details> inside a section before the browser scrolls to it, and
// keeps `aria-current` on the link whose section is in view. Returns a teardown.
let wire: unit => (unit => unit) = %raw(`
  function () {
    if (typeof window === "undefined") return function () {};
    var links = [].slice.call(document.querySelectorAll(".nav__link"));
    if (!links.length) return function () {};

    function idOf(link) {
      var href = link.getAttribute("href") || "";
      return href.charAt(0) === "#" ? href.slice(1) : "";
    }

    function open(id) {
      var section = document.getElementById(id);
      if (!section) return;
      var details = section.querySelector("details");
      if (details && !details.open) details.open = true;
    }

    function onClick(e) {
      open(idOf(e.currentTarget));
    }
    links.forEach(function (l) { l.addEventListener("click", onClick); });

    // A section that is shut is a few pixels tall, so observing the sections
    // themselves would leave the marker stuck on whichever one happens to sit
    // under the band. Observing them all and taking the last one whose top has
    // passed the reading line is stable whether they are open or shut.
    var sections = links.map(function (l) { return document.getElementById(idOf(l)); });
    var ticking = false;

    function mark() {
      ticking = false;
      var line = window.innerHeight * 0.3;
      var current = -1;
      for (var i = 0; i < sections.length; i++) {
        if (sections[i] && sections[i].getBoundingClientRect().top <= line) current = i;
      }
      for (var j = 0; j < links.length; j++) {
        if (j === current) links[j].setAttribute("aria-current", "true");
        else links[j].removeAttribute("aria-current");
      }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(mark);
    }

    mark();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return function () {
      links.forEach(function (l) { l.removeEventListener("click", onClick); });
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }
`)

@react.component
let make = () => {
  let {translations: t} = LanguageContext.useLanguage()
  let entries = Outline.compute(t)

  React.useEffect1(() => Some(wire()), [Array.length(entries)])

  <nav className="nav no-print" ariaLabel={t.record.sections}>
    <ul className="nav__list">
      {entries
      ->Array.map(e =>
        <li key={e.id}>
          <a className="nav__link" href={`#${e.id}`}> {React.string(e.label)} </a>
        </li>
      )
      ->React.array}
    </ul>
  </nav>
}
