<script lang="ts">
  import { onMount } from 'svelte';
  import { tt } from '$lib/i18n';
  let dots = '';
  onMount(() => {
    const id = setInterval(() => {
      dots = dots.length >= 3 ? '' : dots + '.';
    }, 400);
    return () => clearInterval(id);
  });
</script>

<svelte:head>
  <title>admin</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
  <pre class="font-terminal text-4xl text-rose-400">ACCESS DENIED</pre>
  <p class="max-w-sm font-mono text-sm text-zinc-400">
    {$tt({ pt: 'chamando os feds', en: 'calling the feds' })}<span
      class="text-[color:var(--color-gb-light)]">{dots}</span
    >
  </p>
  <p class="font-mono text-xs text-zinc-600">
    ({$tt({ pt: 'brincadeira.', en: 'kidding.' })}
    <a href="/" class="underline hover:text-zinc-300">{$tt({ pt: 'voltar', en: 'back' })}</a>)
  </p>
</main>
