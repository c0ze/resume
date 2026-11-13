// Periods in the content ("2020 - 2023", "July 2021 - July 2022",
// "2021年7月 - 2022年7月", "2024 - Günümüz") as JSON Resume iso8601 dates.
//
// Only the forms the content uses are read, each as a whole: a year; a month
// name and a year (English, Turkish); 年 and 月 (Japanese); or the language's
// word for "present". Anything else throws, so the build fails instead of
// writing a wrong date ("Maybe 2021" is not May; 2021年13月 is not 2021).

const MONTHS = {
  en: ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'],
  tr: ['ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos', 'eylül', 'ekim', 'kasım', 'aralık'],
};
const PRESENT = { en: ['present'], tr: ['günümüz'], ja: ['現在'] };

// Turkish folds İ to i and I to ı; English folds both to i.
const fold = (text, language) => text.toLocaleLowerCase(language === 'tr' ? 'tr-TR' : 'en-US');
const month = (year, number) => `${year}-${String(number).padStart(2, '0')}`;

/**
 * One end of a period: "2021", "2021-07", or undefined for "present".
 * @param {string} text
 * @param {string} language
 */
export function parseDate(text, language) {
  const s = String(text ?? '').trim();
  if (/^\d{4}$/.test(s)) return s;
  const named = s.match(/^(\p{L}+)\s+(\d{4})$/u);
  if (named) {
    const index = (MONTHS[language] ?? []).indexOf(fold(named[1], language));
    if (index >= 0) return month(named[2], index + 1);
  }
  const ja = s.match(/^(\d{4})年(\d{1,2})月$/);
  if (ja && language === 'ja' && Number(ja[2]) >= 1 && Number(ja[2]) <= 12) return month(ja[1], Number(ja[2]));
  if ((PRESENT[language] ?? []).includes(fold(s, language))) return undefined;
  throw new Error(`[${language}] "${s}" is not a date this generator reads (scripts/periods.mjs)`);
}

/**
 * "2024 - Present" → { startDate: "2024" }; "2020 - 2023" → both;
 * "2014" → { startDate: "2014", endDate: "2014" };
 * "July 2021 - July 2022" → { startDate: "2021-07", endDate: "2022-07" }.
 * @param {string} period
 * @param {string} language
 */
export function parsePeriod(period, language) {
  if (typeof period !== 'string' || period.trim() === '') return {};
  const ends = period.split(/\s*[-–]\s*/);
  if (ends.length > 2) throw new Error(`[${language}] "${period}" has more than two ends`);
  const startDate = parseDate(ends[0], language);
  const endDate = ends.length === 2 ? parseDate(ends[1], language) : startDate;
  return { ...(startDate ? { startDate } : {}), ...(endDate ? { endDate } : {}) };
}
