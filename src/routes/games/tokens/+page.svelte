<script lang="ts">
  import TokenCatcher from '$lib/games/TokenCatcher.svelte';
  import GameShell from '$lib/components/GameShell.svelte';
  import { tt } from '$lib/i18n';
</script>

<svelte:head>
  <title>token catcher — plagesribeiro</title>
</svelte:head>

<GameShell
  game="tokens"
  title="token catcher"
  titleClass="text-amber-300 glow-yellow"
  blurb={$tt({ pt: 'cuida do orçamento da OpenAI.', en: 'watch OpenAI’s budget.' })}
  let:handleGameOver
>
  <TokenCatcher onGameOver={handleGameOver} />
</GameShell>
