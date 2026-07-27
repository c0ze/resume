// The four artifacts of record, each attributed to the script that actually
// generated it. This is the countersign: there is no second party in this
// content and inventing a witness is forbidden, so the witness is the build.

@react.component
let make = () => {
  let {language, translations: t} = LanguageContext.useLanguage()
  let c = t.record.columns

  <table className="artifacts">
    <thead>
      <tr>
        <th scope="col"> {React.string(c.format)} </th>
        <th scope="col"> {React.string(c.file)} </th>
        <th scope="col" className="src--col"> {React.string(c.generatedBy)} </th>
        <th scope="col" className="mark"> {React.string(c.issued)} </th>
      </tr>
    </thead>
    <tbody>
      {Download.artifacts(language)
      ->Array.map(a =>
        <tr key={a.format}>
          <td className="fmt"> {React.string(a.format)} </td>
          <td className="file">
            <a href={Download.href(a.file)} download=""> {React.string(a.file)} </a>
            // Narrow sheets drop the third column; the attribution moves under
            // the filename rather than off the page. Provenance is the point.
            <span className="src src--inline"> {React.string(a.generator)} </span>
          </td>
          <td className="src src--col"> {React.string(a.generator)} </td>
          <td className="mark"> {React.string(`✓`)} </td>
        </tr>
      )
      ->React.array}
    </tbody>
  </table>
}
