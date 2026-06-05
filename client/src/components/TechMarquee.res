// A continuously scrolling competency ticker — the "engineering stock ticker"
// band under the hero. Pure CSS marquee (pauses on hover + reduced-motion),
// duplicated once for a seamless loop. Hidden in print via `.marquee-band`.
let techs = [
  "Go",
  "Ruby",
  "Python",
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "React",
  "Vue",
  "Node.js",
  "GraphQL",
  "PostgreSQL",
  "MySQL",
  "CI/CD",
  "Gemini API",
  "Anthropic API",
  "MCP",
  "Playwright",
  "Linux",
]

let pill = (key, label) =>
  <span
    key
    className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-sm text-muted-foreground">
    <span className="h-1 w-1 rounded-full bg-primary/60" ariaHidden=true />
    {React.string(label)}
  </span>

@react.component
let make = () => {
  let row = copy =>
    techs
    ->Array.mapWithIndex((t, j) => pill(`${Int.toString(copy)}-${Int.toString(j)}`, t))
    ->React.array

  <div
    className="marquee-band no-print relative overflow-hidden border-y border-border bg-muted/30 py-3.5"
    ariaHidden=true>
    <div className="mask-fade-x">
      <div className="marquee-track flex items-center gap-9">
        {row(0)}
        {row(1)}
      </div>
    </div>
  </div>
}
