import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import pt from './pt.json';
import en from './en.json';
import type { Locale } from '$lib/data/types';

const STORAGE_KEY = 'site-locale';
const dictionaries: Record<Locale, Record<string, string>> = { pt, en };

function detectLocale(): Locale {
  if (!browser) return 'pt';
  const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
  if (stored === 'pt' || stored === 'en') return stored;
  const nav = navigator.language?.toLowerCase() ?? '';
  return nav.startsWith('pt') ? 'pt' : 'en';
}

export const locale = writable<Locale>(detectLocale());

if (browser) {
  locale.subscribe((value) => {
    localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.lang = value === 'pt' ? 'pt-BR' : 'en';
  });
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  // simple {key} replacement + minimal ICU plural support: {n, plural, one {...} other {...}}
  return template.replace(/\{(\w+)(?:,\s*plural,\s*one\s*\{([^}]*)\}\s*other\s*\{([^}]*)\})?\}/g, (_, key, one, other) => {
    const value = vars[key];
    if (one !== undefined && other !== undefined) {
      const n = Number(value);
      return (n === 1 ? one : other).replace(/\{n\}/g, String(n));
    }
    return value !== undefined ? String(value) : '';
  });
}

export const t: Readable<(key: string, vars?: Record<string, string | number>) => string> = derived(
  locale,
  ($locale) =>
    (key: string, vars: Record<string, string | number> = {}) => {
      const dict = dictionaries[$locale] ?? dictionaries.pt;
      const tpl = dict[key] ?? dictionaries.pt[key] ?? key;
      return interpolate(tpl, vars);
    }
);

export function pick<T>(field: { pt: T; en: T }, current: Locale): T {
  return field[current];
}

/** Inline bilingual helper: `$tt({ pt: 'olá', en: 'hello' })`. */
export const tt: Readable<<T>(msgs: { pt: T; en: T }) => T> = derived(
  locale,
  ($locale) =>
    <T>(msgs: { pt: T; en: T }): T =>
      msgs[$locale]
);
