// Bindings for the Astryx components this page uses (@astryxdesign/core 0.7).
// Props follow `npx astryx component <Name>`; add one here when a section
// needs it. Buttons take their text in `label`; booleans start with is/has.
//
// The theme is the family's built `arda` theme: brand/arda.js is a verbatim
// copy of arda.tr's brand/arda.js (see DESIGN.md), and its stylesheet
// brand/arda.css is imported in Main.res.

// Steps of the spacing scale: 0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10.
type step = float

type size = [#sm | #md | #lg]

module Theme = {
  type t
  @module("./brand/arda.js") external arda: t = "ardaTheme"

  @module("@astryxdesign/core/theme") @react.component
  external make: (
    ~theme: t,
    ~mode: [#light | #dark | #system]=?,
    ~children: React.element,
  ) => React.element = "Theme"
}

// Astryx's own strings ("Close", "(opens in new tab)") in the page's language.
module I18n = {
  type catalog
  type messages = Dict.t<catalog>

  @module("@astryxdesign/core/i18n") @react.component
  external make: (
    ~locale: string,
    ~messages: messages=?,
    ~children: React.element,
  ) => React.element = "InternationalizationProvider"
}

module Button = {
  // The theme's primary is bone on soot; its secondary (the default) is a 1px
  // outline.
  @module("@astryxdesign/core/Button") @react.component
  external make: (
    ~label: string,
    ~variant: [#primary | #secondary | #ghost | #destructive]=?,
    ~size: size=?,
    @as("type") ~type_: [#button | #submit | #reset]=?,
    ~isDisabled: bool=?,
    ~icon: React.element=?,
    // With href the button is an <a>; `download` reaches it unchanged.
    ~href: string=?,
    ~download: string=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
    ~className: string=?,
    @as("aria-haspopup") ~ariaHaspopup: string=?,
    ~ref: ReactDOM.domRef=?,
  ) => React.element = "Button"
}

module IconButton = {
  @module("@astryxdesign/core/IconButton") @react.component
  external make: (
    ~label: string,
    ~icon: React.element,
    ~variant: [#primary | #secondary | #ghost | #destructive]=?,
    ~size: size=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
  ) => React.element = "IconButton"
}

module Icon = {
  // A semantic icon name; the theme's registry supplies the artwork.
  @module("@astryxdesign/core/Icon") @react.component
  external make: (~icon: [#close]) => React.element = "Icon"
}

module Link = {
  // Without href it renders a <button> that reads as a link.
  @module("@astryxdesign/core/Link") @react.component
  external make: (
    ~href: string=?,
    ~rel: string=?,
    ~isExternalLink: bool=?,
    ~hasUnderline: bool=?,
    @as("type") ~type_: [#body | #label | #supporting | #code | #inherit]=?,
    ~onClick: ReactEvent.Mouse.t => unit=?,
    ~className: string=?,
    ~children: React.element,
  ) => React.element = "Link"
}

module Switch = {
  @module("@astryxdesign/core/Switch") @react.component
  external make: (
    ~label: string,
    ~value: bool,
    ~onChange: bool => unit,
    ~size: [#sm | #md]=?,
  ) => React.element = "Switch"
}

module HStack = {
  @module("@astryxdesign/core/HStack") @react.component
  external make: (
    ~gap: step=?,
    ~vAlign: [#start | #center | #end | #stretch]=?,
    ~hAlign: [#start | #center | #end | #between | #around | #evenly]=?,
    ~wrap: [#nowrap | #wrap]=?,
    ~className: string=?,
    ~children: React.element,
  ) => React.element = "HStack"
}

module Text = {
  @module("@astryxdesign/core/Text") @react.component
  external make: (
    @as("type") ~type_: [#body | #large | #label | #supporting | #code]=?,
    ~color: [#primary | #secondary | #accent | #inherit]=?,
    ~weight: [#normal | #medium | #semibold | #bold]=?,
    @as("as") ~as_: [#span | #p | #div | #h2 | #h3]=?,
    ~display: [#inline | #block]=?,
    ~id: string=?,
    ~children: React.element,
  ) => React.element = "Text"
}

module Dialog = {
  // A native modal <dialog>: the page behind is inert, Escape and a click on
  // the backdrop close it, and focus returns to the control that opened it.
  @module("@astryxdesign/core/Dialog") @react.component
  external make: (
    ~isOpen: bool,
    ~onOpenChange: bool => unit,
    ~width: int=?,
    ~padding: step=?,
    ~children: React.element,
  ) => React.element = "Dialog"
}

module DialogHeader = {
  // The title labels the dialog and takes focus on open; passing
  // onOpenChange adds the close button.
  @module("@astryxdesign/core/Dialog") @react.component
  external make: (
    ~title: React.element,
    ~subtitle: React.element=?,
    ~onOpenChange: bool => unit=?,
  ) => React.element = "DialogHeader"
}
