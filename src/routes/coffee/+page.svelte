<script lang="ts">
  import { tt } from '$lib/i18n';
  const art = [
    '            (',
    '              )     (',
    '       ___...(-------)-....___',
    "   .-''       )    (          ''-.",
    "  .-'  ___...---------...___       '-.",
    '   /          )    (              \\',
    '  |   .------ (---) ------------.   |',
    '  |  |                          |   |',
    '   \\  \\                        /   /',
    '    \'-..__                __..-\'',
    '          \'\'----------\'\''
  ].join('\n');
</script>

<svelte:head>
  <title>418 — I'm a teapot</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
  <pre class="font-mono text-xs leading-tight text-[color:var(--color-gb-light)] glow-green select-none">{art}</pre>
  <h1 class="font-pixel text-2xl text-[color:var(--color-gb-light)]">418 · I'M A TEAPOT</h1>
  <p class="max-w-md text-sm text-zinc-400">
    {$tt({
      pt: 'Não consigo te servir café. Mas posso te servir um',
      en: "Can't serve you coffee. But I can serve you a"
    })}
    <a href="/" class="text-[color:var(--color-gb-light)] underline">
      {$tt({ pt: 'portfólio (que não chamo de portfólio)', en: 'portfolio (that I refuse to call a portfolio)' })}
    </a>.
  </p>
</main>
