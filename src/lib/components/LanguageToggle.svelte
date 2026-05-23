<script lang="ts">
  import { locale } from '$lib/i18n';
  import type { Locale } from '$lib/data/types';

  function set(value: Locale) {
    locale.set(value);
  }
</script>

<div
  class="inline-flex items-center gap-0.5 rounded-full border border-zinc-800 bg-zinc-900/70 p-0.5 text-xs font-medium backdrop-blur"
  role="group"
  aria-label="language"
>
  {#each ['pt', 'en'] as code (code)}
    <button
      type="button"
      class="rounded-full px-2.5 py-1 transition-colors {$locale === code
        ? 'bg-[color:var(--color-gb-green)] text-black'
        : 'text-zinc-400 hover:text-zinc-100'}"
      aria-pressed={$locale === code}
      on:click={() => set(code as Locale)}
    >
      {code.toUpperCase()}
    </button>
  {/each}
</div>
