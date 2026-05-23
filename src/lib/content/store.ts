/**
 * Client-side mirror of the Manifest. Populated by `+layout.svelte` from
 * server-side data and read by anything that needs to do lookups without
 * await (terminal autocomplete, ls, cd validation, etc).
 */

import { writable } from 'svelte/store';
import { EMPTY_MANIFEST, type Manifest } from './types';

export const manifestStore = writable<Manifest>(EMPTY_MANIFEST);
