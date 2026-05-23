<script lang="ts">
  import Terminal from '$lib/components/Terminal.svelte';
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';

  export let data;
</script>

<svelte:head>
  <title>$ hack — plagesribeiro</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="min-h-screen px-4 py-8 sm:p-8">
  <a
    href="/"
    class="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur transition hover:border-zinc-600 hover:text-zinc-100"
  >
    <ArrowLeft class="h-3.5 w-3.5" />
    {$tt({ pt: 'voltar pro menu', en: 'back to menu' })}
  </a>

  <div class="mx-auto max-w-3xl">
    <Terminal resume={data.resume} />
  </div>
</main>
