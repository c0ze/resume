// Live "based in Tokyo" time chip for the hero. Renders an em-dash placeholder
// on the server, then ticks every 30s on the client. Brand tie to arda.tr.
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

  <span className="font-mono text-[0.7rem] tracking-wider text-muted-foreground tabular-nums">
    {React.string((time == "" ? "--:--" : time) ++ " JST")}
  </span>
}
