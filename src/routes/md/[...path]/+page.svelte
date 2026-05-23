<script lang="ts">
  import ContentIndex from '$lib/components/ContentIndex.svelte';
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';
  import type { ContentItem } from '$lib/content/manifest';

  export let data:
    | {
        mode: 'file';
        html: string;
        title: string;
        slug: string;
        visibility: 'public' | 'private';
        hasParentListing: boolean;
        parentUrl: string;
      }
    | {
        mode: 'folder';
        items: ContentItem[];
        basePath: string;
        title: string;
      };
</script>

<svelte:head>
  <title>{data.title} — plagesribeiro</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />
</svelte:head>

{#if data.mode === 'folder'}
  <ContentIndex folder="md" title={data.title} items={data.items} basePath={data.basePath} />
{:else}
  <article class="mx-auto max-w-4xl px-6 py-12">
    {#if data.hasParentListing}
      <a
        href={data.parentUrl}
        class="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        {$tt({ pt: 'voltar pra listagem', en: 'back to listing' })}
      </a>
    {/if}

    <header class="mb-8 border-b border-zinc-800 pb-4">
      <p class="font-mono text-xs text-zinc-500">/md/{data.slug}</p>
      <h1 class="mt-1 font-pixel text-xl text-[color:var(--color-gb-light)] glow-green sm:text-2xl">
        {data.title}
      </h1>
    </header>

    <div
      class="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[color:var(--color-gb-light)] prose-code:before:hidden prose-code:after:hidden"
    >
      {@html data.html}
    </div>
  </article>
{/if}

<style>
  :global(.prose pre) {
    border: 1px solid #27272a;
    border-radius: 0.75rem;
    padding: 1rem;
    overflow-x: auto;
    background: #0a0a0a;
  }
  :global(.prose code) {
    font-family: var(--font-mono);
    font-size: 0.9em;
  }
  :global(.prose :not(pre) > code) {
    background: #18181b;
    padding: 0.15em 0.35em;
    border-radius: 0.3em;
    border: 1px solid #27272a;
  }
</style>
