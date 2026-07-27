// The 5mm quad ruling is the layout grid, not a texture behind one.
//
// Two things have to be true for that claim to hold on a real page:
//
//  1. `--q` must be the browser's *own* 5mm, not the ideal 18.8976px. Browsers
//     lay 5mm out as 18.890625px; over a long page the difference walks the
//     laid-out blocks several pixels off the painted gradient.
//  2. Structural edges must land on rules. Prose rides freely between them —
//     body at 0.9375rem/1.75 is 26.25px of leading against an 18.9px quad, and
//     those do not divide. This is a block grid, not a baseline grid; do not
//     promise baselines the arithmetic cannot keep.
//
// So: measure, pin, then nudge each `.js-snap` block's bottom padding down to
// the next rule. Padding-bottom only — React owns these nodes and we do not
// want to fight it over anything it might re-render.

// Measures the browser's real 5mm, pins `--q` to it, and snaps every
// `.js-snap` block's closing edge onto a rule. Returns a teardown that also
// re-runs on resize and on web-font arrival.
let align: unit => (unit => unit) = %raw(`
  function () {
    if (typeof window === "undefined") return function () {};

    function pass() {
      var root = document.documentElement;
      var sheet = document.querySelector(".sheet");
      if (!sheet) return;

      var probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;height:5mm;width:1px";
      document.body.appendChild(probe);
      var q = probe.getBoundingClientRect().height || 18.8976;
      probe.parentNode.removeChild(probe);
      root.style.setProperty("--q", q + "px");

      var origin = sheet.getBoundingClientRect().top + window.scrollY;
      var blocks = sheet.querySelectorAll(".js-snap");
      for (var i = 0; i < blocks.length; i++) {
        var el = blocks[i];
        // Cache the authored padding so repeated passes stay idempotent.
        if (el.dataset.pb === undefined) {
          el.dataset.pb = String(parseFloat(getComputedStyle(el).paddingBottom) || 0);
        }
        var base = parseFloat(el.dataset.pb);
        el.style.paddingBottom = base + "px";
        var r = el.getBoundingClientRect();
        var bottom = r.top + window.scrollY + r.height - origin;
        var delta = Math.ceil(bottom / q) * q - bottom;
        if (delta > 0.5) el.style.paddingBottom = (base + delta).toFixed(2) + "px";
      }
    }

    var raf = 0;
    function schedule() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pass);
    }

    schedule();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    window.addEventListener("resize", schedule);
    return function () {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
    };
  }
`)

// The running folio and running head on the binding. Walks the entries, finds
// the last one whose top has passed the reading line, and writes its page
// number and section name onto the spine.
let followFolio: (Dom.element, Dom.element) => (unit => unit) = %raw(`
  function (folioEl, headEl) {
    if (typeof window === "undefined") return function () {};
    var ticking = false;

    function read() {
      ticking = false;
      var marks = document.querySelectorAll(".js-page");
      if (!marks.length) return;
      var line = window.innerHeight * 0.34;
      var cur = marks[0];
      for (var i = 0; i < marks.length; i++) {
        if (marks[i].getBoundingClientRect().top <= line) cur = marks[i];
      }
      var folio = cur.querySelector(".js-folio");
      var head = cur.querySelector(".js-head");
      var folioText = folio ? folio.textContent.replace(/^p\.\s*/, "") : "";
      var headText = head ? head.textContent : "";
      if (folioEl.textContent !== folioText) folioEl.textContent = folioText;
      if (headEl.textContent !== headText) headEl.textContent = headText;
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
