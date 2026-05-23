<script lang="ts">
  import { locale, tt } from '$lib/i18n';
  export let data;

  $: kind = data.kind;
  $: dims = `${data.w}×${data.h}`;

  const lines = [
    '$ pedrolages --about',
    '> name        Pedro Lages Ribeiro',
    '> role        co-founder · head of product dev',
    '> stack       TypeScript · SvelteKit · LLMs',
    '> remote      Brazil → New York time',
    '> ai_since    GPT-2 (yes, before ChatGPT)',
    '> status      shipping ✓'
  ];

  const koLines = [
    '$ caffeine --status',
    '> intake      cup #3',
    '> output      production-ready code',
    '> ratio       1 commit / 100 mg',
    '> mood        focused & slightly buzzing',
    '> buy_me_one  ↓'
  ];

  $: shownLines = kind === 'kofi' ? koLines : lines;
</script>

<svelte:head>
  <title>banner — {dims}</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="page">
  <div class="hint">
    <span>📸</span>
    {$tt({
      pt: `screenshot exato em ${dims}px (DevTools → device toolbar)`,
      en: `screenshot exactly ${dims}px (DevTools → device toolbar)`
    })}
    <a href="?for=linkedin" class:active={kind === 'linkedin'}>linkedin</a>
    <a href="?for=kofi" class:active={kind === 'kofi'}>kofi</a>
  </div>

  <main
    class="banner banner--{kind}"
    style="width: {data.w}px; height: {data.h}px;"
    aria-label={data.label}
  >
    <div class="grid"></div>
    <div class="glow"></div>

    <div class="content">
      <pre class="terminal">{shownLines.join('\n')}</pre>

      <div class="hero">
        {#if kind === 'kofi'}
          <h1 class="title">
            <span class="accent">buy me a</span>
            <span class="big">coffee</span>
          </h1>
          <p class="sub">
            {$tt({
              pt: 'porque o terceiro café é o que vira código bom',
              en: 'because the third cup is the one that ships'
            })}
          </p>
        {:else}
          <h1 class="title">
            <span class="big">engineer</span>
            <span class="accent">who still writes tests</span>
          </h1>
          <p class="sub">LLMs since GPT-2 · multimodal models · clean code</p>
        {/if}
        <div class="url">pedrolages.dev</div>
      </div>
    </div>
  </main>
</div>

<style>
  :global(html),
  :global(body) {
    background: #050505;
    margin: 0;
    padding: 0;
  }

  .page {
    min-height: 100vh;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    background: #050505;
  }

  .hint {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: ui-monospace, 'Geist Mono', monospace;
    font-size: 12px;
    color: #71717a;
    padding: 8px 14px;
    border: 1px solid #27272a;
    border-radius: 999px;
    background: #0a0a0a;
  }
  .hint a {
    color: #a3a3a3;
    text-decoration: none;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid transparent;
  }
  .hint a:hover {
    color: #fafafa;
    border-color: #3f3f46;
  }
  .hint a.active {
    color: #9bbc0f;
    border-color: #9bbc0f55;
    background: #9bbc0f1a;
  }

  .banner {
    position: relative;
    overflow: hidden;
    background:
      radial-gradient(circle at 18% 50%, rgba(155, 188, 15, 0.18), transparent 55%),
      radial-gradient(circle at 88% 80%, rgba(48, 98, 48, 0.25), transparent 60%),
      linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
    color: #fafafa;
    font-family: ui-monospace, 'Geist Mono', monospace;
    border-radius: 4px;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(155, 188, 15, 0.06) 1px, transparent 1px),
      linear-gradient(90deg, rgba(155, 188, 15, 0.06) 1px, transparent 1px);
    background-size: 32px 32px;
    pointer-events: none;
  }

  .glow {
    position: absolute;
    width: 60%;
    height: 200%;
    top: -50%;
    left: -10%;
    background: radial-gradient(ellipse, rgba(155, 188, 15, 0.1), transparent 65%);
    filter: blur(40px);
    pointer-events: none;
  }

  .content {
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    padding: 56px 72px;
    height: 100%;
    box-sizing: border-box;
    align-items: center;
  }

  .terminal {
    font-size: 22px;
    line-height: 1.55;
    color: #d4d4d8;
    margin: 0;
    padding: 24px 28px;
    border: 1px solid rgba(155, 188, 15, 0.35);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.55);
    box-shadow:
      0 0 0 1px rgba(0, 0, 0, 0.4) inset,
      0 0 40px rgba(155, 188, 15, 0.12);
    backdrop-filter: blur(2px);
    white-space: pre;
    overflow: hidden;
  }

  .hero {
    display: flex;
    flex-direction: column;
    gap: 18px;
    align-items: flex-start;
  }

  .title {
    margin: 0;
    line-height: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .big {
    font-size: 72px;
    font-weight: 800;
    letter-spacing: -2px;
    color: #fafafa;
  }

  .accent {
    font-size: 30px;
    font-weight: 500;
    color: #9bbc0f;
    text-shadow: 0 0 18px rgba(155, 188, 15, 0.4);
  }

  .sub {
    margin: 0;
    font-size: 18px;
    color: #a1a1aa;
  }

  .url {
    margin-top: 4px;
    font-family: ui-monospace, 'Geist Mono', monospace;
    font-size: 18px;
    color: #9bbc0f;
    padding: 6px 14px;
    border: 1px solid rgba(155, 188, 15, 0.4);
    border-radius: 999px;
    background: rgba(155, 188, 15, 0.1);
  }

  .banner--kofi .big {
    font-size: 96px;
  }
  .banner--kofi .accent {
    font-size: 26px;
  }
</style>
