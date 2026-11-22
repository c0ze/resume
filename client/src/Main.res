// Stylesheets, in cascade order: the layer order first, then Astryx's reset
// and components, the family's built theme and patterns (verbatim copies of
// arda.tr's brand/, see DESIGN.md), and this page's own rules last.
%%raw(`import "./layers.css"`)
%%raw(`import "@astryxdesign/core/reset.css"`)
%%raw(`import "@astryxdesign/core/astryx.css"`)
%%raw(`import "./brand/arda.css"`)
%%raw(`import "./brand/brand.css"`)
%%raw(`import "./index.css"`)

switch ReactDOM.querySelector("#root") {
| Some(root) =>
  ReactDOM.Client.createRoot(root)->ReactDOM.Client.Root.render(
    <LanguageContext>
      <App />
    </LanguageContext>,
  )
| None => Console.error("Could not find #root element")
}
