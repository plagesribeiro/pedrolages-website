<script lang="ts">
  import Hero from '$lib/components/Hero.svelte';
  import Stats from '$lib/components/Stats.svelte';
  import About from '$lib/components/About.svelte';
  import Timeline from '$lib/components/Timeline.svelte';
  import Skills from '$lib/components/Skills.svelte';
  import Education from '$lib/components/Education.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import { reveal } from '$lib/utils/reveal';
  import { tt } from '$lib/i18n';
  import { ArrowLeft } from '@lucide/svelte';

  export let data;
</script>

<svelte:head>
  <title>{data.resume.name} — about</title>
</svelte:head>

<main class="relative">
  <a
    href="/"
    class="fixed top-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur transition hover:border-zinc-600 hover:text-zinc-100 print:hidden"
  >
    <ArrowLeft class="h-3.5 w-3.5" />
    {$tt({ pt: 'voltar', en: 'back' })}
  </a>

  <Hero resume={data.resume} />
  <div use:reveal><Stats resume={data.resume} /></div>
  <div use:reveal><About resume={data.resume} /></div>
  <div use:reveal><Timeline resume={data.resume} /></div>
  <div use:reveal><Skills resume={data.resume} /></div>
  <div use:reveal><Education resume={data.resume} /></div>
  <Footer resume={data.resume} />
</main>
