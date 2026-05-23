<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { locale, pick, tt } from '$lib/i18n';
  import PixelAvatar from '$lib/components/PixelAvatar.svelte';
  import RotatingTagline from '$lib/components/RotatingTagline.svelte';
  import Particles from '$lib/components/Particles.svelte';
  import MenuButton from '$lib/components/MenuButton.svelte';
  import StalkPanel from '$lib/components/StalkPanel.svelte';
  import ContactPanel from '$lib/components/ContactPanel.svelte';
  import KofiFab from '$lib/components/KofiFab.svelte';
  import { yearsSince } from '$lib/utils/dates';

  export let data;
  $: resume = data.resume;
  $: taglines = pick(resume.taglines, $locale);
  $: years = yearsSince(resume.careerStart);

  let booted = false;
  $: bootLines =
    $locale === 'pt'
      ? ['$ booting plagesribeiro.os ...', '$ carregando módulo personalidade ...', '$ pronto.']
      : ['$ booting plagesribeiro.os ...', '$ loading personality module ...', '$ ready.'];
  let visibleBoot = 0;
  let parallaxX = 0;
  let parallaxY = 0;
  let cursor = 0;
  let menuEl: HTMLElement;
  let openPanel: 'stalk' | 'contact' | null = null;

  type LinkItem = {
    kind: 'link';
    href: string;
    labelPt: string;
    labelEn: string;
    hintPt: string;
    hintEn: string;
    badge?: string;
  };
  type ExpandItem = {
    kind: 'expand';
    panelId: 'stalk' | 'contact';
    labelPt: string;
    labelEn: string;
    hintPt: string;
    hintEn: string;
  };
  type Item = LinkItem | ExpandItem;

  const items: Item[] = [
    {
      kind: 'link',
      href: '/about',
      labelPt: 'sobre o pedro',
      labelEn: 'about pedro',
      hintPt: 'a história, o currículo, a piada',
      hintEn: 'the story, the cv, the joke'
    },
    {
      kind: 'link',
      href: '/hack',
      labelPt: '$ hack me',
      labelEn: '$ hack me',
      hintPt: 'terminal interativo',
      hintEn: 'interactive terminal'
    },
    {
      kind: 'link',
      href: '/games',
      labelPt: 'jogar',
      labelEn: 'play',
      hintPt: 'snake, pong, e mais',
      hintEn: 'snake, pong, and more',
      badge: 'NEW'
    },
    {
      kind: 'expand',
      panelId: 'stalk',
      labelPt: 'me stalkear',
      labelEn: 'stalk me',
      hintPt: 'redes sociais e cv',
      hintEn: 'socials and cv'
    },
    {
      kind: 'expand',
      panelId: 'contact',
      labelPt: 'me contactar',
      labelEn: 'contact me',
      hintPt: 'email e whatsapp',
      hintEn: 'email and whatsapp'
    }
  ];

  function focusItem(i: number) {
    cursor = (i + items.length) % items.length;
    const elems = menuEl?.querySelectorAll<HTMLElement>('[data-menu-item]');
    elems?.[cursor]?.focus();
  }

  function togglePanel(id: 'stalk' | 'contact') {
    openPanel = openPanel === id ? null : id;
  }

  function activate(i: number) {
    const it = items[i];
    if (it.kind === 'link') {
      goto(it.href);
    } else {
      togglePanel(it.panelId);
    }
  }

  function onKey(e: KeyboardEvent) {
    const tgt = e.target as HTMLElement;
    if (tgt && (tgt.tagName === 'INPUT' || tgt.tagName === 'TEXTAREA')) return;
    const k = e.key;
    if (k === 'ArrowDown' || k === 'j' || k === 's' || k === 'S') {
      e.preventDefault();
      focusItem(cursor + 1);
    } else if (k === 'ArrowUp' || k === 'k' || k === 'w' || k === 'W') {
      e.preventDefault();
      focusItem(cursor - 1);
    } else if (k === 'Escape') {
      if (openPanel) {
        e.preventDefault();
        openPanel = null;
      }
    } else if (k >= '1' && k <= '9') {
      const i = Number(k) - 1;
      if (i < items.length) {
        e.preventDefault();
        activate(i);
      }
    }
  }

  onMount(() => {
    const id = setInterval(() => {
      if (visibleBoot < bootLines.length) visibleBoot += 1;
      else {
        booted = true;
        clearInterval(id);
      }
    }, 280);

    const onMove = (e: MouseEvent) => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      parallaxX = (e.clientX - cx) / cx;
      parallaxY = (e.clientY - cy) / cy;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

<svelte:head>
  <title>{resume.name}</title>
</svelte:head>

<main class="relative isolate min-h-screen overflow-hidden">
  <div class="absolute inset-0 -z-10">
    <Particles density={80} />
  </div>
  <div
    aria-hidden="true"
    class="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,#000_30%,transparent_75%)]"
    style="background-image: radial-gradient(rgba(155,188,15,0.10) 1px, transparent 1px); background-size: 28px 28px;"
  ></div>

  <div
    class="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-8 px-6 py-12"
  >
    <div
      class="relative will-change-transform"
      style:transform="translate3d({parallaxX * 8}px, {parallaxY * 8}px, 0)"
    >
      <PixelAvatar />
    </div>

    <div class="text-center">
      <p class="font-pixel text-[10px] text-zinc-500">
        ★ <kbd class="kbd">↑</kbd> <kbd class="kbd">↓</kbd> · <kbd class="kbd">W</kbd>/<kbd
          class="kbd">S</kbd
        >
        · <kbd class="kbd">enter</kbd> · <kbd class="kbd">1-5</kbd> · <kbd class="kbd">?</kbd> ★
      </p>
      <h1 class="mt-3 font-pixel text-2xl leading-tight glow-green sm:text-3xl lg:text-4xl">
        {resume.name}
      </h1>
      <div class="mt-3 font-mono text-sm text-zinc-400">
        <RotatingTagline lines={taglines} />
      </div>
      <p class="mt-2 font-mono text-xs text-zinc-600">
        {years}+ {$tt({ pt: 'anos', en: 'yrs' })} · co-founder @ goodstream · belo horizonte ⇄ nyc
      </p>
    </div>

    <nav bind:this={menuEl} class="flex w-full max-w-md flex-col gap-3" aria-label="main menu">
      {#each items as item, i (item.kind === 'link' ? item.href : item.panelId)}
        <div
          on:mouseenter={() => (cursor = i)}
          class={cursor === i ? 'menu-cursor-on' : ''}
          role="presentation"
        >
          {#if item.kind === 'link'}
            <MenuButton
              href={item.href}
              label={$locale === 'pt' ? item.labelPt : item.labelEn}
              hint={$locale === 'pt' ? item.hintPt : item.hintEn}
              badge={item.badge ?? ''}
              index={i}
              dataAttr="menu-item"
            />
          {:else}
            <MenuButton
              label={$locale === 'pt' ? item.labelPt : item.labelEn}
              hint={$locale === 'pt' ? item.hintPt : item.hintEn}
              index={i}
              dataAttr="menu-item"
              expanded={openPanel === item.panelId}
              panelId={`panel-${item.panelId}`}
              on:toggle={() => togglePanel(item.panelId)}
            />
            {#if item.panelId === 'stalk'}
              <StalkPanel {resume} open={openPanel === 'stalk'} id="panel-stalk" />
            {:else}
              <ContactPanel {resume} open={openPanel === 'contact'} id="panel-contact" />
            {/if}
          {/if}
        </div>
      {/each}
    </nav>

    <div class="mt-4 max-w-md text-center font-mono text-[11px] text-zinc-600">
      <div class="space-y-0.5">
        {#each bootLines.slice(0, visibleBoot) as line, i}
          <p class={i === visibleBoot - 1 && !booted ? 'text-[color:var(--color-gb-light)]' : ''}>
            {line}
          </p>
        {/each}
        {#if booted}
          <p class="text-zinc-700">
            ★ {$tt({ pt: 'terminal', en: 'terminal' })}: <kbd class="kbd">⌘K</kbd> ·
            <kbd class="kbd">?</kbd>
            · {$tt({ pt: 'digite', en: 'type' })}
            <span class="text-[color:var(--color-gb-light)]">whoami</span>
            · <kbd class="kbd">↑↑↓↓←→←→BA</kbd>
          </p>
        {/if}
      </div>
    </div>
  </div>

  {#if resume.links.kofi}
    <KofiFab href={resume.links.kofi} />
  {/if}
</main>

<style>
  :global(.kbd) {
    border-radius: 0.25rem;
    border: 1px solid rgb(63 63 70);
    background: rgb(24 24 27);
    padding: 0 0.3rem;
    font-size: 10px;
    color: rgb(212 212 216);
    font-family: var(--font-mono);
  }
  :global(.menu-cursor-on a),
  :global(.menu-cursor-on > button) {
    border-color: rgba(155, 188, 15, 0.7) !important;
    background: rgba(24, 24, 27, 0.95) !important;
  }
</style>
