// Local time where the record is kept. Renders a placeholder on the server,
// then ticks every 30s on the client. Tabular figures, like every other number
// on the page.
let startClock: (string => unit) => (unit => unit) = %raw(`
  function (setTime) {
    function fmt() {
      try {
        return new Intl.DateTimeFormat("en-GB", {
          timeZone: "Asia/Tokyo",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).format(new Date());
      } catch (e) {
        return "";
      }
    }
    setTime(fmt());
    var id = setInterval(function () {
      setTime(fmt());
    }, 30000);
    return function () {
      clearInterval(id);
    };
  }
`)

@react.component
let make = () => {
  let (time, setTime) = React.useState(() => "")

  React.useEffect0(() => Some(startClock(t => setTime(_ => t))))

  // Nothing at all until there is a real reading. The separator lives here
  // rather than in the caller so that a prerendered page — or one read with
  // JavaScript off — shows "Chofu, Tokyo" and not "Chofu, Tokyo · --:-- JST",
  // which reads as a broken page rather than as an absent clock.
  time == ""
    ? React.null
    : <span className="tabular"> {React.string(`· ${time} JST`)} </span>
}
