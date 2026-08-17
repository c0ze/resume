// Period strings are free text and differ per language ("2024 - Present",
// "2021年7月 - 2022年7月", "July 2021 - July 2022"). The one thing they all
// carry is four-digit years, so that is the only thing read out of them.

let years: string => array<int> = %raw(`
  function (s) {
    var m = String(s || "").match(/\d{4}/g);
    return m ? m.map(Number) : [];
  }
`)

let currentYear: int = %raw(`new Date().getFullYear()`)

// An engagement whose period carries a single year is the open one — the
// current role. True of "2024 - Present", "2024年 - 現在" and "2024 - Halen"
// alike, because the test is the count of four-digit years rather than any
// one language's word for "present".
let isOpen = (period: string) => Array.length(years(period)) < 2

// The span covered by a list of periods. An engagement whose *first* period
// carries a single year is the open one — the current role — so the record runs
// to this year rather than to the last year printed on it.
let span = (periods: array<string>): option<(int, int)> => {
  let all = periods->Array.flatMap(years)
  if Array.length(all) === 0 {
    None
  } else {
    let start = all->Array.reduce(9999, (a, b) => a < b ? a : b)
    let printedEnd = all->Array.reduce(0, (a, b) => a > b ? a : b)
    let openEnded = switch periods->Array.get(0) {
    | Some(p) => Array.length(years(p)) < 2
    | None => false
    }
    Some((start, openEnded ? currentYear : printedEnd))
  }
}

let format = (periods: array<string>) =>
  switch span(periods) {
  | Some((a, b)) => a === b ? Int.toString(a) : `${Int.toString(a)}–${Int.toString(b)}`
  | None => ""
  }
