@module("react-dom/server")
external renderToString: React.element => string = "renderToString"

let render = (_url: string) => {
  let html = renderToString(
    <ThemeContext>
      <LanguageContext>
        <App />
      </LanguageContext>
    </ThemeContext>,
  )
  {"html": html}
}
