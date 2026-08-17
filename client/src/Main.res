%%raw(`import "./index.css"`)
%%raw(`import "./theme.css"`)

// Every section prints, whatever the engine does with a closed <details>.
// The print stylesheet handles this on engines that expose either mechanism;
// this covers the rest, and restores the reader's own open/closed state after.
%%raw(`
  if (typeof window !== "undefined" && window.matchMedia) {
    var restore = [];
    window.addEventListener("beforeprint", function () {
      restore = [];
      document.querySelectorAll("details").forEach(function (d) {
        restore.push([d, d.open]);
        d.open = true;
      });
    });
    window.addEventListener("afterprint", function () {
      restore.forEach(function (pair) { pair[0].open = pair[1]; });
      restore = [];
    });
  }
`)

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.Client.createRoot(root)->ReactDOM.Client.Root.render(
    <ThemeContext>
      <LanguageContext>
        <App />
      </LanguageContext>
    </ThemeContext>,
  )
| None => Console.error("Could not find #root element")
}
