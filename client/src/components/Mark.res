// The employer or institution mark.
//
// PRODUCT.md commits to these being real assets used as marks, so they are not
// decoration to be dropped for tidiness. They are rendered monochrome — and
// inverted on the dark renditions, where a dark logo would otherwise vanish —
// because eleven brand palettes entering a one-accent system would cost the
// page more than the recognition is worth.
//
// Monochrome is not licence to make them faint. At 1.05rem and 0.7 opacity they
// resolved to grey discs: the palette cost of an image with none of the
// recognition it exists to buy. They are sized and contrasted to actually be
// read at a glance, or they should not be here at all.
//
// Decorative in the accessibility tree: the employer's name is already beside
// it as real text, so announcing it twice helps nobody.

let assetBase: string = %raw(`import.meta.env.BASE_URL`)

@react.component
let make = (~logo: option<string>) =>
  switch logo {
  | Some(file) if file !== "" =>
    <span className="mark" ariaHidden=true>
      <img src={`${assetBase}images/logos/${file}`} alt="" loading={#"lazy"} />
    </span>
  | _ => React.null
  }
