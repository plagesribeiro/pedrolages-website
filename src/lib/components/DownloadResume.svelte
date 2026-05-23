<script lang="ts">
  import { locale, t } from '$lib/i18n';
  import { Download, Loader2 } from '@lucide/svelte';
  import type { Resume } from '$lib/data/types';

  export let resume: Resume;
  let busy = false;

  async function download() {
    busy = true;
    try {
      const { downloadResumePDF } = await import('$lib/utils/pdf');
      downloadResumePDF(resume, $locale);
    } finally {
      // brief delay so the spinner isn't a flash
      setTimeout(() => (busy = false), 400);
    }
  }
</script>

<button
  type="button"
  on:click={download}
  disabled={busy}
  class="group inline-flex items-center gap-2 rounded-full border border-[color:var(--color-gb-green)]/50 bg-[color:var(--color-gb-green)]/15 px-4 py-2 text-sm font-medium text-[color:var(--color-gb-light)] transition hover:bg-[color:var(--color-gb-green)]/25 hover:border-[color:var(--color-gb-green)]/80 disabled:opacity-60"
>
  {#if busy}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else}
    <Download class="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
  {/if}
  {$t('cta.download')}
</button>
