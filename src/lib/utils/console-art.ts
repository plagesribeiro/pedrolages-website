import type { Locale } from '$lib/data/types';

/** ASCII art + recruiter bait for visitors who open DevTools. */
export function printConsoleArt(email: string, locale: Locale = 'pt'): void {
  const art = `
   ____  _____ ____  ____   ___
  |  _ \\| ____|  _ \\|  _ \\ / _ \\
  | |_) |  _| | | | | |_) | | | |
  |  __/| |___| |_| |  _ <| |_| |
  |_|   |_____|____/|_| \\_\\\\___/
  `;
  const css = 'color:#9bbc0f;font-family:monospace;text-shadow:0 0 8px #9bbc0f55;';
  console.log('%c' + art, css);

  const intro =
    locale === 'pt'
      ? 'se você é dev ou recruiter curioso — manda email: '
      : 'if you are a curious dev or recruiter — drop an email: ';
  console.log(
    '%c' + intro + '%c' + email,
    'color:#a1a1aa;font-family:monospace;',
    'color:#facc15;font-family:monospace;font-weight:bold;'
  );

  const moreEggs =
    locale === 'pt'
      ? 'mais easter eggs: tente ↑↑↓↓←→←→BA, digite "whoami" ou aperte ?'
      : 'more easter eggs: try ↑↑↓↓←→←→BA, type "whoami" or hit ?';
  console.log('%c' + moreEggs, 'color:#71717a;font-family:monospace;font-style:italic;');
}
