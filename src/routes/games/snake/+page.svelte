<script lang="ts">
  import Snake from '$lib/games/Snake.svelte';
  import GameShell from '$lib/components/GameShell.svelte';
  import { tt } from '$lib/i18n';
</script>

<svelte:head>
  <title>snake — plagesribeiro</title>
</svelte:head>

<GameShell
  game="snake"
  title="snake"
  blurb={$tt({ pt: 'cuidado com as bombas.', en: 'watch out for the bombs.' })}
  let:handleGameOver
>
  <Snake onGameOver={handleGameOver} />
</GameShell>
