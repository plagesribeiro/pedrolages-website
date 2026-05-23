/** Returns whole years elapsed since the given YYYY-MM or YYYY-MM-DD string. */
export function yearsSince(dateString: string, now: Date = new Date()): number {
  const [y, m = '1', d = '1'] = dateString.split('-');
  const start = new Date(Number(y), Number(m) - 1, Number(d));
  let years = now.getFullYear() - start.getFullYear();
  const monthDiff = now.getMonth() - start.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < start.getDate())) {
    years -= 1;
  }
  return Math.max(0, years);
}

const monthNames = {
  pt: ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
} as const;

/** Formats "YYYY-MM" or "YYYY" into a short human label. */
export function formatMonth(dateString: string | undefined, locale: 'pt' | 'en'): string {
  if (!dateString) return '';
  const [y, m] = dateString.split('-');
  if (!m) return y;
  const idx = Number(m) - 1;
  return `${monthNames[locale][idx]}/${y.slice(2)}`;
}

export function formatRange(
  start: string,
  end: string | undefined,
  current: boolean | undefined,
  locale: 'pt' | 'en'
): string {
  const left = formatMonth(start, locale);
  const right = current ? (locale === 'pt' ? 'hoje' : 'present') : formatMonth(end, locale);
  return right ? `${left} → ${right}` : left;
}
