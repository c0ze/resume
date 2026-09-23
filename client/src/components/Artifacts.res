// The four artifacts, each attributed to the script that actually generated
// it. Shown inside the certificate of issue: the witness is the build.

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()
  let c = t.record.columns

  <table className="artifacts">
    <thead>
      <tr>
        <th scope="col"> {React.string(c.format)} </th>
        <th scope="col"> {React.string(c.file)} </th>
        <th scope="col" className="artifacts__src"> {React.string(c.generatedBy)} </th>
      </tr>
    </thead>
    <tbody>
      {Download.artifacts(language)
      ->Array.map(a =>
        <tr key={a.format}>
          <td> {React.string(a.format)} </td>
          <td>
            <a href={Download.href(a.file)} download=""> {React.string(a.file)} </a>
          </td>
          <td className="artifacts__src"> {React.string(a.generator)} </td>
        </tr>
      )
      ->React.array}
    </tbody>
  </table>
}
