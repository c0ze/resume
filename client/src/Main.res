%%raw(`import "./index.css"`)
%%raw(`import "./theme.css"`)

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
