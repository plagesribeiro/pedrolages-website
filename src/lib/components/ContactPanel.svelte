<script lang="ts">
  import type { Resume } from '$lib/data/types';
  import { locale, tt } from '$lib/i18n';
  import { Mail, MessageCircle, Copy, Check } from '@lucide/svelte';

  export let resume: Resume;
  export let open: boolean = false;
  export let id: string = 'contact-panel';

  $: whatsappLink = resume.links.whatsapp
    ? `https://wa.me/${resume.links.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        $locale === 'pt' ? 'oi pedro, vim do seu site' : 'hey pedro, came from your site'
      )}`
    : '';
  $: mailLink = `mailto:${resume.email}?subject=${encodeURIComponent(
    $locale === 'pt' ? 'oi, vim do seu site' : 'hi, came from your site'
  )}`;

  let copiedKey: string | null = null;
  async function copy(value: string, key: string, e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      copiedKey = key;
      setTimeout(() => (copiedKey = null), 1500);
    } catch {}
  }
</script>

<div {id} role="region" aria-label="contact" class="panel" class:open aria-hidden={!open}>
  <div class="panel-inner">
    <div class="grid grid-cols-1 gap-2 pt-3 sm:grid-cols-2">
      <a href={mailLink} class="mini-card group">
        <div class="card-icon"><Mail class="h-4 w-4" /></div>
        <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">EMAIL</p>
        <p class="mt-0.5 break-all text-[11px] text-zinc-300 group-hover:text-zinc-100">
          {resume.email}
        </p>
        <button
          type="button"
          class="mt-2 inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-200"
          on:click={(e) => copy(resume.email, 'mail', e)}
        >
          {#if copiedKey === 'mail'}
            <Check class="h-3 w-3" /> {$tt({ pt: 'copiado', en: 'copied' })}
          {:else}
            <Copy class="h-3 w-3" /> {$tt({ pt: 'copiar email', en: 'copy email' })}
          {/if}
        </button>
      </a>

      {#if resume.links.whatsapp}
        <a href={whatsappLink} target="_blank" rel="noopener" class="mini-card group">
          <div class="card-icon"><MessageCircle class="h-4 w-4" /></div>
          <p class="font-pixel text-[10px] text-[color:var(--color-gb-light)]">WHATSAPP</p>
          <p class="mt-0.5 text-[11px] text-zinc-300 group-hover:text-zinc-100">
            {resume.links.whatsapp}
          </p>
          <button
            type="button"
            class="mt-2 inline-flex items-center gap-1 text-[10px] text-zinc-500 hover:text-zinc-200"
            on:click={(e) => copy(resume.links.whatsapp ?? '', 'wa', e)}
          >
            {#if copiedKey === 'wa'}
              <Check class="h-3 w-3" /> {$tt({ pt: 'copiado', en: 'copied' })}
            {:else}
              <Copy class="h-3 w-3" /> {$tt({ pt: 'copiar número', en: 'copy number' })}
            {/if}
          </button>
        </a>
      {/if}
    </div>
  </div>
</div>

<style>
  .panel {
    display: grid;
    grid-template-rows: 0fr;
    opacity: 0;
    transition:
      grid-template-rows 220ms ease-out,
      opacity 180ms ease-out;
  }
  .panel.open {
    grid-template-rows: 1fr;
    opacity: 1;
  }
  .panel-inner {
    overflow: hidden;
    min-height: 0;
  }
  @media (prefers-reduced-motion: reduce) {
    .panel {
      transition: none;
    }
  }
</style>
