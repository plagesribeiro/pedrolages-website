<script lang="ts">
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';
  import Tree from '$lib/components/Tree.svelte';
  import type { ContentItem } from '$lib/content/manifest';
  export let data: { items: ContentItem[] };
</script>

<svelte:head>
  <title>{$tt({ pt: 'documentos', en: 'documents' })} — plagesribeiro</title>
</svelte:head>

<main class="min-h-screen px-6 py-12">
  <a
    href="/"
    class="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100"
  >
    <ArrowLeft class="h-3.5 w-3.5" />
    {$tt({ pt: 'voltar', en: 'back' })}
  </a>

  <div class="mx-auto max-w-2xl">
    <header class="border-b border-zinc-800 pb-6">
      <p class="font-mono text-xs text-zinc-500">/docs</p>
      <h1
        class="mt-1 font-pixel text-2xl text-[color:var(--color-gb-light)] glow-green sm:text-3xl"
      >
        {$tt({ pt: 'documentos', en: 'documents' })}
      </h1>
      <p class="mt-2 text-sm text-zinc-400">
        {$tt({
          pt: 'markdown, html e pdf direto do drive. só públicos aqui — clica na pasta pra abrir.',
          en: 'markdown, html and pdf straight from drive. public only at root — click a folder to open.'
        })}
      </p>
    </header>

    {#if data.items.length === 0}
      <p class="mt-12 text-center font-mono text-sm text-zinc-600">
        {$tt({ pt: 'nada por enquanto.', en: 'nothing here yet.' })}
      </p>
    {:else}
      <div class="mt-8">
        <Tree items={data.items} basePath="" baseUrl="/docs" />
      </div>
    {/if}
  </div>
</main>
