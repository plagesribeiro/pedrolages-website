import { writable } from 'svelte/store';

export type TerminalTone = 'accent' | 'muted' | 'err' | 'warn';
export interface TerminalLine {
  text: string;
  tone?: TerminalTone;
}

/** Shared output buffer. Same terminal across /hack and the global modal. */
export const terminalLines = writable<TerminalLine[]>([]);

/** Shared command history (↑/↓). */
export const terminalHistory = writable<string[]>([]);

/** Current working directory (mirrors site routes). */
export const terminalCwd = writable<string>('/');

/** Track whether the boot sequence (banner + whoami) already ran this session. */
export const terminalBooted = writable<boolean>(false);

/** Locale of the last boot — used to re-render the banner when language changes. */
export const terminalBootedLocale = writable<'pt' | 'en' | null>(null);
