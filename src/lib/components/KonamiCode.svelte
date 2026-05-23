<script lang="ts">
  import { onMount } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { tt } from '$lib/i18n';

  const SEQUENCE = [
    'ArrowUp',
    'ArrowUp',
    'ArrowDown',
    'ArrowDown',
    'ArrowLeft',
    'ArrowRight',
    'ArrowLeft',
    'ArrowRight',
    'b',
    'a'
  ];

  let progress: string[] = [];
  let open = false;
  export let active = false;

  function onKey(e: KeyboardEvent) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    progress = [...progress, key].slice(-SEQUENCE.length);
    if (progress.length === SEQUENCE.length && progress.every((k, i) => k === SEQUENCE[i])) {
      open = true;
      progress = [];
    }
  }

  function onTrigger() {
    open = true;
  }

  // Allow parent to trigger via `active` prop
  $: if (active) {
    open = true;
    active = false;
  }

  function close() {
    open = false;
  }

  function onClose(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    window.addEventListener('keydown', onClose);
    window.addEventListener('konami:trigger', onTrigger);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keydown', onClose);
      window.removeEventListener('konami:trigger', onTrigger);
    };
  });
</script>

{#if open}
  <div
    class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6 backdrop-blur"
    transition:fade={{ duration: 200 }}
    on:click|self={close}
    on:keydown|self={(e) => e.key === 'Escape' && close()}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
  >
    <div
      class="relative max-w-lg w-full rounded-2xl border border-[color:var(--color-gb-green)]/40 bg-zinc-950 p-8 shadow-[0_0_60px_-10px_rgba(155,188,15,0.45)]"
      in:fly={{ y: 20, duration: 250 }}
    >
      <pre
        class="font-mono text-[10px] leading-none text-[color:var(--color-gb-light)] glow-green text-center select-none">
{`
   ____ ____ ____ ____ ____ ____
  ||S |||E |||C |||R |||E |||T ||
  ||__|||__|||__|||__|||__|||__||
  |/__\\|/__\\|/__\\|/__\\|/__\\|/__\\|
        S T A G E   ★ ★ ★
`}
      </pre>
      <div class="mt-4 space-y-3 text-center">
        <p class="font-pixel text-xs text-[color:var(--color-gb-light)]">UNLOCKED</p>
        <p class="text-sm text-zinc-300">
          {$tt({
            pt: 'Você achou o Konami. Como agradecimento, aqui vai uma',
            en: 'You found the Konami code. Have a'
          })}
          <span class="font-mono text-[color:var(--color-gb-light)]"
            >{$tt({ pt: '+1 vida', en: '+1 life' })}</span
          >.
        </p>
        <p class="text-xs text-zinc-500">
          {$tt({ pt: 'Bônus: digite', en: 'Bonus: type' })}
          <kbd class="rounded border border-zinc-700 bg-zinc-900 px-1 font-mono text-[10px]"
            >whoami</kbd
          >
          {$tt({ pt: 'em qualquer página.', en: 'on any page.' })}
        </p>
        <button
          class="mt-2 inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1.5 text-xs text-zinc-300 hover:border-zinc-500"
          on:click={close}
        >
          {$tt({ pt: 'continuar', en: 'continue' })} ▶
        </button>
      </div>
    </div>
  </div>
{/if}
