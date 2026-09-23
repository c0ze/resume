// Local time where the résumé is kept, in the status bar: "JST 18:19:16".
// Renders a placeholder on the server, then ticks every second on the client.
// Tabular figures, so the bar does not shimmer as the digits change.
let startClock: (string => unit) => (unit => unit) = %raw(`
  function (setTime) {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Tokyo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return function () {};
    }
    function tick() { setTime(fmt.format(new Date())); }
    tick();
    var id = setInterval(tick, 1000);
    return function () { clearInterval(id); };
  }
`)

@react.component
let make = () => {
  let (time, setTime) = React.useState(() => "")

  React.useEffect0(() => Some(startClock(t => setTime(_ => t))))

  <span className="bar__clock">
    {React.string("JST " ++ (time == "" ? "--:--:--" : time))}
  </span>
}
