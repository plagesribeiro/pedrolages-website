<script lang="ts">
  import { locale, t, tt } from '$lib/i18n';
  import { ArrowLeft, Mail, Coffee, MessageCircle, Copy, Check } from '@lucide/svelte';
  import BrandIcon from '$lib/components/BrandIcon.svelte';
  import Particles from '$lib/components/Particles.svelte';

  export let data;
  $: resume = data.resume;
  $: whatsappLink = resume.links.whatsapp
    ? `https://wa.me/${resume.links.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        $locale === 'pt' ? 'oi pedro, vim do seu site' : 'hey pedro, came from your site'
      )}`
    : '';
  $: mailLink = `mailto:${resume.email}?subject=${encodeURIComponent(
    $locale === 'pt' ? 'oi, vim do seu site' : 'hi, came from your site'
  )}`;

  let copiedKey: string | null = null;
  async function copy(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      copiedKey = key;
      setTimeout(() => (copiedKey = null), 1500);
    } catch {}
  }
</script>

<svelte:head>
  <title>stalk me — {resume.name}</title>
</svelte:head>

<main class="relative isolate min-h-screen overflow-hidden">
  <div class="absolute inset-0 -z-10">
    <Particles density={50} color="#facc15" speed={0.15} />
  </div>

  <a
    href="/"
    class="fixed top-4 left-4 z-40 inline-flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-950/70 px-3 py-1.5 text-xs text-zinc-400 backdrop-blur transition hover:border-zinc-600 hover:text-zinc-100"
  >
    <ArrowLeft class="h-3.5 w-3.5" /> {$tt({ pt: 'voltar', en: 'back' })}
  </a>

  <div class="mx-auto max-w-3xl px-6 py-20">
    <header class="text-center">
      <p class="font-pixel text-[10px] text-zinc-500">/* stage 04 */</p>
      <h1 class="mt-2 font-pixel text-2xl text-[color:var(--color-gb-light)] glow-green sm:text-3xl">stalk me.</h1>
      <p class="mt-3 mx-auto max-w-md text-sm text-zinc-400">
        {$locale === 'pt'
          ? 'me manda mensagem, me paga um café ou só dá uma bisbilhotada nas redes. tudo válido.'
          : "drop a message, buy me a coffee, or just creep on the socials. all valid."}
      </p>
    </header>

    <section class="mt-12 grid gap-4 sm:grid-cols-2">
      <a
        href={mailLink}
        class="card group"
      >
        <div class="card-icon"><Mail class="h-5 w-5" /></div>
        <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">EMAIL</p>
        <p class="mt-1 break-all text-sm text-zinc-300 group-hover:text-zinc-100">{resume.email}</p>
        <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'clica pra abrir o cliente de email', en: 'opens your mail client' })}</p>
      </a>

      {#if resume.links.whatsapp}
        <a href={whatsappLink} target="_blank" rel="noopener" class="card group">
          <div class="card-icon"><MessageCircle class="h-5 w-5" /></div>
          <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">WHATSAPP</p>
          <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">{resume.links.whatsapp}</p>
          <button
            type="button"
            class="mt-3 inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-200"
            on:click|preventDefault={() => copy(resume.links.whatsapp ?? '', 'wa')}
          >
            {#if copiedKey === 'wa'}
              <Check class="h-3 w-3" /> {$tt({ pt: 'copiado', en: 'copied' })}
            {:else}
              <Copy class="h-3 w-3" /> {$tt({ pt: 'copiar número', en: 'copy number' })}
            {/if}
          </button>
        </a>
      {/if}

      {#if resume.links.kofi}
        <a href={resume.links.kofi} target="_blank" rel="noopener" class="card group">
          <div class="card-icon"><Coffee class="h-5 w-5" /></div>
          <p class="font-pixel text-[11px] text-amber-300">BUY ME A COFFEE</p>
          <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">ko-fi.com/plagesribeiro</p>
          <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'meu mestrado agradece ☕', en: "my master's degree thanks you ☕" })}</p>
        </a>
      {/if}

      {#if resume.links.instagram}
        <a href={resume.links.instagram} target="_blank" rel="noopener" class="card group">
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9 3.72 3.72 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.34 4.14.63a5.88 5.88 0 0 0-2.12 1.39A5.88 5.88 0 0 0 .63 4.14C.34 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.27 2.15.56 2.91a5.88 5.88 0 0 0 1.39 2.12 5.88 5.88 0 0 0 2.12 1.39c.76.29 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.27 2.91-.56a5.88 5.88 0 0 0 2.12-1.39 5.88 5.88 0 0 0 1.39-2.12c.29-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.27-2.15-.56-2.91a5.88 5.88 0 0 0-1.39-2.12A5.88 5.88 0 0 0 19.86.63C19.1.34 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-10.4a1.44 1.44 0 1 0 0-2.88 1.44 1.44 0 0 0 0 2.88z"/></svg>
          </div>
          <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">INSTAGRAM</p>
          <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">@pedro_lagesr</p>
          <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'mais aleatório', en: 'more random' })}</p>
        </a>
      {/if}

      {#if resume.links.lattes}
        <a href={resume.links.lattes} target="_blank" rel="noopener" class="card group">
          <div class="card-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </div>
          <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">LATTES</p>
          <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">CV acadêmico</p>
          <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'pra olhar o lado científico', en: 'for the academic side' })}</p>
        </a>
      {/if}

      <a href={resume.links.linkedin} target="_blank" rel="noopener" class="card group">
        <div class="card-icon"><BrandIcon name="linkedin" size={18} /></div>
        <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">LINKEDIN</p>
        <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">in/plagesribeiro</p>
        <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'mais formal', en: 'more formal' })}</p>
      </a>

      <a href={resume.links.github} target="_blank" rel="noopener" class="card group">
        <div class="card-icon"><BrandIcon name="github" size={18} /></div>
        <p class="font-pixel text-[11px] text-[color:var(--color-gb-light)]">GITHUB</p>
        <p class="mt-1 text-sm text-zinc-300 group-hover:text-zinc-100">@plagesribeiro</p>
        <p class="mt-3 text-xs text-zinc-500">{$tt({ pt: 'onde mora o código', en: 'where the code lives' })}</p>
      </a>
    </section>

    <p class="mt-12 text-center font-mono text-xs text-zinc-600">
      ★ {$tt({ pt: 'prefere terminal? digita', en: 'terminal person? type' })} <code class="text-[color:var(--color-gb-light)]">contact</code> {$tt({ pt: 'em', en: 'in' })} <a href="/hack" class="underline">/hack</a>
    </p>
  </div>
</main>

<style>
  :global(.card) {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 1rem;
    border: 1px solid rgb(39 39 42);
    background: rgba(9 9 11 / 0.6);
    backdrop-filter: blur(8px);
    padding: 1.25rem;
    transition: all 250ms;
  }
  :global(.card:hover) {
    border-color: rgba(155, 188, 15, 0.5);
    transform: translateY(-2px);
    box-shadow: 0 12px 40px -20px rgba(155, 188, 15, 0.4);
  }
  :global(.card-icon) {
    display: inline-flex;
    height: 2.25rem;
    width: 2.25rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    border: 1px solid rgb(39 39 42);
    background: rgba(24 24 27 / 0.8);
    color: rgb(228 228 231);
    margin-bottom: 0.75rem;
    transition: transform 250ms;
  }
  :global(.card:hover .card-icon) {
    transform: scale(1.08) rotate(-4deg);
  }
</style>
