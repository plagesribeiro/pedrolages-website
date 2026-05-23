<script lang="ts">
  import ContentIndex from '$lib/components/ContentIndex.svelte';
  import { tt } from '$lib/i18n';
  import { ArrowLeft, Download, ExternalLink } from '@lucide/svelte';
  import type { ContentItem } from '$lib/content/manifest';

  export let data:
    | {
        mode: 'file';
        url: string;
        title: string;
        slug: string;
        visibility: 'public' | 'private';
        hasParentListing: boolean;
        parentUrl: string;
      }
    | { mode: 'folder'; items: ContentItem[]; basePath: string; title: string };
</script>

<svelte:head>
  <title>{data.title} — plagesribeiro</title>
</svelte:head>

{#if data.mode === 'folder'}
  <ContentIndex folder="pdf" title={data.title} items={data.items} basePath={data.basePath} />
{:else}
  <main class="mx-auto max-w-5xl px-6 py-12">
    {#if data.hasParentListing}
      <a
        href={data.parentUrl}
        class="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        {$tt({ pt: 'voltar pra listagem', en: 'back to listing' })}
      </a>
    {/if}

    <header
      class="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-zinc-800 pb-4"
    >
      <div>
        <p class="font-mono text-xs text-zinc-500">/pdf/{data.slug}</p>
        <h1
          class="mt-1 font-pixel text-xl text-[color:var(--color-gb-light)] glow-green sm:text-2xl"
        >
          {data.title}
        </h1>
      </div>
      <div class="flex items-center gap-2">
        <a
          href={data.url}
          download
          class="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
        >
          <Download class="h-3.5 w-3.5" />
          {$tt({ pt: 'baixar', en: 'download' })}
        </a>
        <a
          href={data.url}
          target="_blank"
          rel="noopener"
          class="inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-600 hover:text-zinc-100"
        >
          <ExternalLink class="h-3.5 w-3.5" />
          {$tt({ pt: 'abrir em nova aba', en: 'open in new tab' })}
        </a>
      </div>
    </header>

    <iframe
      src={data.url}
      title={data.title}
      class="h-[82vh] w-full rounded-xl border border-zinc-800 bg-zinc-950"
    ></iframe>
    <p class="mt-3 text-center text-xs text-zinc-600">
      {$tt({
        pt: 'PDF embedado. se não carregar, use os botões acima.',
        en: 'embedded PDF. if it does not load, use the buttons above.'
      })}
    </p>
  </main>
{/if}
