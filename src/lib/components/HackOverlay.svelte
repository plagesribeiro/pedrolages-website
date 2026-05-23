<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { tt, locale } from '$lib/i18n';

  export let open = false;
  const dispatch = createEventDispatcher<{ close: void }>();

  let lang: 'pt' | 'en' = 'pt';
  locale.subscribe((v) => (lang = v));

  $: phases =
    lang === 'pt'
      ? [
          'estabelecendo conexão.....',
          'bypass no firewall.....',
          'quebrando criptografia (md5? sério?).....',
          'acessando root.....',
          'decodificando dados pessoais.....',
          'baixando 2 anos de conversa....',
          'BREACH SUCCESSFUL'
        ]
      : [
          'establishing connection.....',
          'bypassing firewall.....',
          'cracking encryption (md5? really?).....',
          'accessing root.....',
          'decoding personal data.....',
          'downloading 2 years of chat history....',
          'BREACH SUCCESSFUL'
        ];

  let stage: 'booting' | 'revealed' | 'punchline' = 'booting';
  let visibleLines = 0;
  let progress = 0;
  let timer: ReturnType<typeof setInterval> | null = null;

  $: if (open) reset();
  function reset() {
    stage = 'booting';
    visibleLines = 0;
    progress = 0;
    if (timer) clearInterval(timer);
    timer = setInterval(() => {
      if (visibleLines < phases.length) {
        visibleLines += 1;
        progress = Math.round((visibleLines / phases.length) * 100);
      } else if (stage === 'booting') {
        stage = 'revealed';
        setTimeout(() => (stage = 'punchline'), 2200);
      }
    }, 380);
  }

  function close() {
    if (timer) clearInterval(timer);
    timer = null;
    open = false;
    dispatch('close');
  }

  function onKey(e: KeyboardEvent) {
    if (!open) return;
    if (e.key === 'Escape') close();
  }

  onMount(() => {
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      if (timer) clearInterval(timer);
    };
  });

  const cryFace = [
    '   _____',
    '  /     \\',
    ' | () () |',
    ' |   ʌ   |',
    '  \\  ︵  /',
    '   ‾‾‾‾‾'
  ].join('\n');
</script>

{#if open}
  <div
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-6 backdrop-blur"
    transition:fade={{ duration: 250 }}
    role="dialog"
    aria-modal="true"
    tabindex="-1"
  >
    {#if stage === 'booting'}
      <div class="w-full max-w-xl font-mono text-sm" in:fly={{ y: 8, duration: 200 }}>
        <div class="flex items-center gap-2 text-rose-400">
          <span class="h-2 w-2 animate-pulse rounded-full bg-rose-400"></span>
          <span class="font-pixel text-[10px] tracking-wider">EXECUTING `hack`</span>
        </div>
        <div class="mt-4 space-y-1 text-[color:var(--color-gb-light)]">
          {#each phases.slice(0, visibleLines) as line, i}
            <p in:fade>
              <span class="text-zinc-500">$</span>
              {line}
              <span class="ml-1 text-zinc-500">[ok]</span>
            </p>
          {/each}
        </div>
        <div
          class="mt-6 h-1.5 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-950"
        >
          <div
            class="h-full bg-[color:var(--color-gb-green)] transition-all duration-300"
            style:width="{progress}%"
          ></div>
        </div>
        <p class="mt-2 font-mono text-[11px] text-zinc-500">{progress}%</p>
      </div>
    {:else if stage === 'revealed'}
      <div class="flex flex-col items-center gap-4 text-center" in:fly={{ y: 20, duration: 300 }}>
        <pre class="font-pixel text-[14px] leading-tight text-rose-400 select-none">{cryFace}</pre>
        <h2 class="font-pixel text-2xl text-rose-300 glow-yellow sm:text-3xl">
          {$tt({ pt: 'VOCÊ ME HACKEOU.', en: "YOU'VE HACKED ME." })}
        </h2>
        <p class="font-mono text-zinc-300">
          {$tt({ pt: 'você será lembrado.', en: 'you will be remembered.' })}
        </p>
        <p class="font-terminal text-2xl text-zinc-500">🥺</p>
      </div>
    {:else}
      <div
        class="flex max-w-md flex-col items-center gap-4 text-center"
        in:fly={{ y: 12, duration: 250 }}
      >
        <pre
          class="font-pixel text-[12px] leading-tight text-[color:var(--color-gb-light)] select-none">{`
   ____   _   _
  / ___| | \\ | |
 | |  _  |  \\| |
 | |_| | | |\\  |
  \\____| |_| \\_|
        gotcha
`}</pre>
        <p class="text-zinc-300">
          {$tt({ pt: 'brincadeira. era um', en: 'just kidding. that was a' })}
          <span class="font-mono text-[color:var(--color-gb-light)]">setTimeout</span>.
        </p>
        <p class="text-sm text-zinc-500">
          {$tt({ pt: 'mas já que veio até aqui — diz oi:', en: 'but while you’re here — say hi:' })}
          <a
            class="text-[color:var(--color-gb-light)] underline"
            href="mailto:plagesribeiro@gmail.com">plagesribeiro@gmail.com</a
          >
        </p>
        <button
          on:click={close}
          class="mt-2 rounded-full border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-zinc-200 hover:border-[color:var(--color-gb-green)]/50"
        >
          {$tt({ pt: 'fechar', en: 'close' })}
        </button>
      </div>
    {/if}

    <button
      class="absolute top-4 right-4 text-xs text-zinc-500 hover:text-zinc-200"
      on:click={close}
      aria-label="close"
    >
      ESC
    </button>
  </div>
{/if}
