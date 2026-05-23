<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher<{ secret: void }>();

  let clicks = 0;
  let glitch = false;

  function onClick() {
    clicks += 1;
    if (clicks >= 7) {
      glitch = true;
      dispatch('secret');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('konami:trigger'));
      }
      setTimeout(() => {
        glitch = false;
        clicks = 0;
      }, 1200);
    }
  }

  // 16x16 retro head sprite. 0=transparent, 1=skin, 2=hair, 3=outline, 4=eye, 5=mouth, 6=shirt
  const sprite = [
    '0003333333000000',
    '0033222222330000',
    '0322222222223000',
    '3222222222222300',
    '3222111111122300',
    '3211111111111230',
    '3211144114411230',
    '3211144114411230',
    '3211111111111230',
    '3211111155111230',
    '3211111111111230',
    '0322111111122300',
    '0033211111223000',
    '0066333333660000',
    '0666666666666600',
    '6666666666666666'
  ];

  const palette: Record<string, string> = {
    '0': 'transparent',
    '1': '#f3d0a7',
    '2': '#3b2417',
    '3': '#0a0a0a',
    '4': '#0a0a0a',
    '5': '#6b2b2b',
    '6': '#306230'
  };

  // blink animation: swap the eye row periodically
  let blink = false;
  onMount(() => {
    const id = setInterval(() => {
      blink = true;
      setTimeout(() => (blink = false), 140);
    }, 3800);
    return () => clearInterval(id);
  });

  const SIZE = 16;
  $: rows = sprite.map((row, y) =>
    row.split('').map((cell, x) => {
      // blink: replace eye pixels with skin
      if (blink && (y === 6 || y === 7) && cell === '4') return '1';
      return cell;
    })
  );
</script>

<button
  type="button"
  class="group relative inline-block animate-[float_3.4s_ease-in-out_infinite] focus:outline-none"
  on:click={onClick}
  aria-label="Pedro's avatar — click to find out"
>
  <svg
    class="pixelated h-32 w-32 sm:h-40 sm:w-40 transition-transform duration-200 group-hover:scale-105 {glitch
      ? 'animate-pulse'
      : ''}"
    viewBox={`0 0 ${SIZE} ${SIZE}`}
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    {#each rows as row, y}
      {#each row as cell, x}
        {#if cell !== '0'}
          <rect
            x={x}
            y={y}
            width="1"
            height="1"
            fill={glitch ? (Math.random() > 0.85 ? '#facc15' : palette[cell]) : palette[cell]}
          />
        {/if}
      {/each}
    {/each}
  </svg>
  {#if glitch}
    <span
      class="pointer-events-none absolute -inset-2 rounded-full bg-[color:var(--color-gb-green)]/20 blur-2xl"
    ></span>
  {/if}
</button>
