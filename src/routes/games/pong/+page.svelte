<script lang="ts">
  import Pong from '$lib/games/Pong.svelte';
  import GameShell from '$lib/components/GameShell.svelte';
  import { tt } from '$lib/i18n';
</script>

<svelte:head>
  <title>pong — plagesribeiro</title>
</svelte:head>

<GameShell
  game="pong"
  title="pong vs ai"
  titleClass="text-zinc-100"
  blurb={$tt({ pt: 'primeiro a 5. a ai melhora a cada ponto.', en: 'first to 5. ai sharpens up each point.' })}
  let:handleGameOver
>
  <Pong onGameOver={(_winner, score) => handleGameOver(score)} />
</GameShell>
