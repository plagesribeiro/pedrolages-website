/** ASCII art + recruiter bait for visitors who open DevTools. */
export function printConsoleArt(email: string): void {
  const art = `
   ____  _____ ____  ____   ___
  |  _ \\| ____|  _ \\|  _ \\ / _ \\
  | |_) |  _| | | | | |_) | | | |
  |  __/| |___| |_| |  _ <| |_| |
  |_|   |_____|____/|_| \\_\\\\___/
  `;
  const css = 'color:#9bbc0f;font-family:monospace;text-shadow:0 0 8px #9bbc0f55;';
  console.log('%c' + art, css);
  console.log(
    '%cse você é dev ou recruiter curioso — manda email: %c' + email,
    'color:#a1a1aa;font-family:monospace;',
    'color:#facc15;font-family:monospace;font-weight:bold;'
  );
  console.log(
    '%cmais easter eggs: tente ↑↑↓↓←→←→BA, digite "whoami" ou aperte ?',
    'color:#71717a;font-family:monospace;font-style:italic;'
  );
}
