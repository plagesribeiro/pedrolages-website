<script lang="ts">
  import WhackBug from '$lib/games/WhackBug.svelte';
  import GameShell from '$lib/components/GameShell.svelte';
  import { tt } from '$lib/i18n';
</script>

<svelte:head>
  <title>whack-a-bug — plagesribeiro</title>
</svelte:head>

<GameShell
  game="bugs"
  title="whack-a-bug"
  titleClass="text-rose-400"
  blurb={$tt({ pt: '30s. não dá pra dar shipping em feature.', en: "30s. don't ship features." })}
  let:handleGameOver
>
  <WhackBug onGameOver={handleGameOver} />
</GameShell>
