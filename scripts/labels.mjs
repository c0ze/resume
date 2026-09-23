// Shared label composition for the résumé generators.
//
// Some content values in content/{en,ja,tr}/*.json already carry their own
// trailing colon and some do not — legitimately, because they are used two
// different ways:
//
//   Printed as-is (the colon is part of the string, and must stay):
//     education.entries[].additionalInfo.title  "Selected Papers:" / "論文:"
//     pdf_meta.generatedOn                      "Generated on:" / "生成日:"
//
//   Composed with a separator by the generator (the colon must NOT be there):
//     about.languages                           "Spoken languages:" / "言語"
//
// `about.languages` was written with a colon in en and tr but without one in
// ja, so the PDF and DOCX printed "Spoken languages:: …" and
// "Konuşulan diller:: …" while Japanese came out correct by accident.
//
// Normalising here rather than in the content files means a future translation
// is safe whichever convention it follows, and the JSON schema — which is a
// contract with four generators and the ai.arda.tr bot — stays untouched.
//
// This is deliberately NOT applied to every label. The two values above rely
// on their trailing colon; stripping it globally would break them.

/**
 * Compose a field label with its separator, tolerating a label that already
 * ends in a colon (ASCII or fullwidth) and/or trailing whitespace.
 *
 *   fieldLabel('Spoken languages:')  -> 'Spoken languages: '
 *   fieldLabel('Konuşulan diller:')  -> 'Konuşulan diller: '
 *   fieldLabel('言語')                -> '言語: '
 *
 * @param {string} label     the raw content value
 * @param {string} separator appended verbatim; defaults to a colon and space
 * @returns {string}
 */
export function fieldLabel(label, separator = ': ') {
  if (typeof label !== 'string') return separator;
  return label.replace(/[\s:：]+$/u, '') + separator;
}

/**
 * Split `about.languagesContent` into one entry per spoken language.
 *
 * Entries are separated by a comma (en, tr) or 、 (ja). A certificate sits in
 * the brackets with a comma of its own ("English (Near Native; TOEFL 263,
 * 2004)"), so only commas outside brackets separate entries.
 *
 *   splitSpokenLanguages('Turkish (Native), English (Near Native; TOEFL 263, 2004)')
 *     -> ['Turkish (Native)', 'English (Near Native; TOEFL 263, 2004)']
 *
 * @param {string} content
 * @returns {string[]}
 */
export function splitSpokenLanguages(content) {
  if (typeof content !== 'string') return [];
  return content
    .split(/\s*[,、，]\s*(?![^()（）]*[)）])/u)
    .map((entry) => entry.trim())
    .filter(Boolean);
}
