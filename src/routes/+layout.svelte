<script lang="ts">
  import '../app.css';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import LanguageToggle from '$lib/components/LanguageToggle.svelte';
  import KonamiCode from '$lib/components/KonamiCode.svelte';
  import TerminalEasterEgg from '$lib/components/TerminalEasterEgg.svelte';
  import { printConsoleArt } from '$lib/utils/console-art';
  import { manifestStore } from '$lib/content/store';
  import { locale } from '$lib/i18n';
  import { get } from 'svelte/store';

  export let data;

  // Mirror the server-loaded manifest into a client store so synchronous code
  // (terminal lookups, autocomplete, etc.) can read it.
  $: manifestStore.set(data.manifest);

  onMount(() => {
    printConsoleArt(data.resume.email, get(locale));
  });
</script>

<svelte:head>
  <title>{data.resume.name} — {data.resume.headline[$locale]}</title>
  <meta name="description" content={data.resume.headline[$locale]} />
  <meta property="og:title" content={data.resume.name} />
  <meta property="og:description" content={data.resume.headline[$locale]} />
  <meta property="og:type" content="website" />
</svelte:head>

<div class="relative min-h-screen">
  <div class="fixed top-4 right-4 z-40 print:hidden">
    <LanguageToggle />
  </div>

  {#key $page.url.pathname}
    <div in:fade={{ duration: 220, delay: 80 }} class="contents">
      <slot />
    </div>
  {/key}
</div>

<KonamiCode />
<TerminalEasterEgg resume={data.resume} />

<style>
  :global(.reveal-init) {
    opacity: 0;
    transform: translateY(12px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }
  :global(.reveal-init.is-visible) {
    opacity: 1;
    transform: none;
  }
  @media print {
    :global(body) {
      background: white !important;
      color: black !important;
    }
  }
</style>
