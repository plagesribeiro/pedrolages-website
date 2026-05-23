<script lang="ts">
  import { onMount } from 'svelte';

  export let lines: string[];
  export let interval = 2800;

  let index = 0;
  let visible = true;

  onMount(() => {
    if (lines.length <= 1) return;
    const id = setInterval(() => {
      visible = false;
      setTimeout(() => {
        index = (index + 1) % lines.length;
        visible = true;
      }, 200);
    }, interval);
    return () => clearInterval(id);
  });

  $: line = lines[index] ?? '';
</script>

<span
  class="inline-block min-h-[1.5em] text-[color:var(--color-gb-light)] transition-opacity duration-200 {visible
    ? 'opacity-100'
    : 'opacity-0'}"
>
  <span class="select-none text-zinc-500">&gt;</span>
  {line}
  <span class="ml-0.5 inline-block h-4 w-2 -mb-0.5 bg-[color:var(--color-gb-light)] animate-[blink_1s_steps(2)_infinite]"></span>
</span>
