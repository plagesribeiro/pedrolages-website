<script lang="ts">
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';
  import type { ContentItem } from '$lib/content/manifest';
  import Tree from './Tree.svelte';

  export let folder: 'md' | 'html' | 'tex';
  export let title: string;
  export let items: ContentItem[] = [];
  /** When inside a sub-folder route, basePath is the folder path (e.g. "notas"). */
  export let basePath: string = '';

  $: prefix = `/${folder}`;
  $: baseUrl = basePath ? `${prefix}/${basePath}` : prefix;
  $: parentUrl = basePath ? basePath.includes('/') ? `${prefix}/${basePath.split('/').slice(0, -1).join('/')}` : prefix : '/';
</script>

<svelte:head>
  <title>{title} — plagesribeiro</title>
</svelte:head>

<main class="min-h-screen px-6 py-12">
  <a href={parentUrl} class="mb-6 inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100">
    <ArrowLeft class="h-3.5 w-3.5" /> {$tt({ pt: 'voltar', en: 'back' })}
  </a>

  <div class="mx-auto max-w-2xl">
    <header class="border-b border-zinc-800 pb-6">
      <p class="font-mono text-xs text-zinc-500">{baseUrl}</p>
      <h1 class="mt-1 font-pixel text-2xl text-[color:var(--color-gb-light)] glow-green sm:text-3xl">
        {title}
      </h1>
      <p class="mt-2 text-sm text-zinc-400">
        {$tt({
          pt: 'só arquivos públicos. pastas começam fechadas — clica no nome pra abrir a rota, ou na setinha pra expandir aqui.',
          en: 'public files only. folders are collapsed — click the name to open the route, or the chevron to expand inline.'
        })}
      </p>
    </header>

    {#if items.length === 0}
      <p class="mt-12 text-center font-mono text-sm text-zinc-600">
        {$tt({ pt: 'nada por enquanto.', en: 'nothing here yet.' })}
      </p>
    {:else}
      <div class="mt-8">
        <Tree {items} {basePath} {baseUrl} />
      </div>
    {/if}
  </div>
</main>
