// The status bar: the family's 34px mono strip across the top of the page.
//
// Site mark, section nav, EN · JA · TR, the JST clock and the rendition switch.
// It stays pinned while the page scrolls and marks the section being read
// (aria-current="location"), which is the running head of the page. On a phone
// the nav folds into one button that names the current section and opens the
// list; nothing in the bar ever scrolls sideways.

let languages = [(Translations.En, "EN"), (Translations.Ja, "JA"), (Translations.Tr, "TR")]

// Calls `set(id)` with the section whose top has passed the reading line (30%
// down the viewport), or the last section once the page bottoms out. Returns a
// teardown.
let followSection: (array<string>, string => unit) => (unit => unit) = %raw(`
  function (ids, set) {
    if (typeof window === "undefined") return function () {};
    var ticking = false, last = null;
    function read() {
      ticking = false;
      var line = window.innerHeight * 0.3, cur = "";
      for (var i = 0; i < ids.length; i++) {
        var el = document.getElementById(ids[i]);
        if (el && el.getBoundingClientRect().top <= line) cur = ids[i];
      }
      var doc = document.documentElement;
      if (cur && window.scrollY + window.innerHeight >= doc.scrollHeight - 4) cur = ids[ids.length - 1];
      if (cur !== last) { last = cur; set(cur); }
    }
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    }
    read();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return function () {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }
`)

// Escape and outside clicks close the phone menu.
let dismissOn: (Dom.element, unit => unit) => (unit => unit) = %raw(`
  function (root, close) {
    function onKey(e) { if (e.key === "Escape") close(); }
    function onDown(e) { if (!root.contains(e.target)) close(); }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return function () {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }
`)

@react.component
let make = () => {
  let {language, setLanguage, translations: t} = LanguageContext.useLanguage()
  let (current, setCurrent) = React.useState(() => "")
  let (menuOpen, setMenuOpen) = React.useState(() => false)
  let menuRef = React.useRef(Nullable.null)

  React.useEffect0(() => Some(followSection(Section.ids, id => setCurrent(_ => id))))

  React.useEffect1(() =>
    switch (menuOpen, menuRef.current->Nullable.toOption) {
    | (true, Some(el)) => Some(dismissOn(el, () => setMenuOpen(_ => false)))
    | _ => None
    }
  , [menuOpen])

  let links = (~onPick=?, ()) =>
    Section.ids
    ->Array.map(id =>
      <a
        key=id
        href={`#${id}`}
        ariaCurrent=?{current == id ? Some(#location) : None}
        onClick=?{onPick->Option.map(f => _ => f())}>
        {React.string(Section.navLabel(t.navigation, id))}
      </a>
    )
    ->React.array

  let hereLabel = current == "" ? t.record.sections : Section.navLabel(t.navigation, current)

  <header className="bar no-print">
    <a className="bar__site" href="#top" ariaLabel="resume.arda.tr">
      <i ariaHidden=true />
      <span> {React.string("resume.arda.tr")} </span>
    </a>

    <nav className="bar__nav" ariaLabel={t.record.sections}> {links()} </nav>

    <div className="bar__menu" ref={ReactDOM.Ref.domRef(menuRef)}>
      <button
        type_="button"
        className="bar__here"
        ariaExpanded=menuOpen
        ariaControls="bar-menu"
        onClick={_ => setMenuOpen(o => !o)}>
        <span className="bar__sect" ariaHidden=true> {React.string(`§`)} </span>
        {React.string(hereLabel)}
        <span ariaHidden=true> {React.string(menuOpen ? ` ▴` : ` ▾`)} </span>
      </button>
      {menuOpen
        ? <nav id="bar-menu" className="bar__drop" ariaLabel={t.record.sections}>
            {links(~onPick=() => setMenuOpen(_ => false), ())}
          </nav>
        : React.null}
    </div>

    <span className="bar__sp" />

    <div className="bar__lang" role="group" ariaLabel={t.record.language}>
      {languages
      ->Array.mapWithIndex(((lang, label), i) =>
        <React.Fragment key=label>
          {i == 0 ? React.null : <span className="bar__dot" ariaHidden=true> {React.string(`·`)} </span>}
          <button
            type_="button"
            lang={Translations.languageToString(lang)}
            ariaPressed={language == lang ? #"true" : #"false"}
            onClick={_ => setLanguage(lang)}>
            {React.string(label)}
          </button>
        </React.Fragment>
      )
      ->React.array}
    </div>

    <TokyoClock />
    <ThemeToggle />
  </header>
}
