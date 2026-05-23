<script lang="ts">
  import { tt } from '$lib/i18n';
  export let data;

  $: kind = data.kind;
  $: dims = `${data.w}×${data.h}`;

  const linkedinLines = [
    '$ pedrolages --about',
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
    {#if kind === 'linkedin'}
      <span class="ln-hint">
        {$tt({
          pt: 'canto inf. esq. reservado pra foto do perfil',
          en: 'bottom-left reserved for profile photo'
        })}
      </span>
    {/if}
  </div>

  {#if kind === 'linkedin'}
    <main
      class="banner banner--linkedin"
      style="width: {data.w}px; height: {data.h}px;"
      aria-label={data.label}
    >
      <div class="grid"></div>
      <div class="spotlight"></div>

      <div class="ln-layout">
        <div class="ln-safe-zone" aria-hidden="true"></div>

        <div class="ln-content">
          <div class="ln-hero">
            <h1 class="ln-name">PEDRO LAGES RIBEIRO</h1>
            <p class="ln-tagline">
              <span class="ln-role">Co-founder · Software Engineer</span>
              <span class="ln-dot">·</span>
              <span class="ln-ai">AI Solutions Specialist</span>
            </p>
          </div>

          <pre class="terminal terminal--ln">{linkedinLines.join('\n')}</pre>

          <div class="ln-contact">
            <span class="ln-contact-item">
              <span class="ln-key">github</span> @plagesribeiro
            </span>
            <span class="ln-sep">|</span>
            <span class="ln-contact-item">
              <span class="ln-key">email</span> plagesribeiro@gmail.com
            </span>
            <span class="ln-sep">|</span>
            <span class="ln-contact-item">
              <span class="ln-key">site</span> pedrolages.dev
            </span>
          </div>
        </div>
      </div>
    </main>
  {:else}
    <main
      class="banner banner--kofi"
      style="width: {data.w}px; height: {data.h}px;"
      aria-label={data.label}
    >
      <div class="grid"></div>
      <div class="glow"></div>

      <div class="content">
        <pre class="terminal">{koLines.join('\n')}</pre>

        <div class="hero">
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
          <div class="url">pedrolages.dev</div>
        </div>
      </div>
    </main>
  {/if}
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
  .ln-hint {
    color: #a1a1aa;
    font-style: italic;
    padding-left: 6px;
    border-left: 1px solid #27272a;
  }

  .banner {
    position: relative;
    overflow: hidden;
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

  /* ───────── LinkedIn banner ───────── */
  .banner--linkedin {
    background:
      radial-gradient(circle at 80% 35%, rgba(155, 188, 15, 0.18), transparent 50%),
      linear-gradient(135deg, #0a0a0a 0%, #161616 60%, #1a1a1a 100%);
  }

  .spotlight {
    position: absolute;
    width: 600px;
    height: 600px;
    left: -100px;
    bottom: -150px;
    background: radial-gradient(circle, rgba(155, 188, 15, 0.1), transparent 65%);
    filter: blur(60px);
    pointer-events: none;
  }

  .ln-layout {
    position: relative;
    display: grid;
    grid-template-columns: 400px 1fr;
    height: 100%;
    padding: 40px 64px 40px 32px;
    box-sizing: border-box;
    gap: 32px;
  }

  .ln-safe-zone {
    position: relative;
  }

  .ln-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 14px;
    min-width: 0;
  }

  .ln-hero {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .ln-name {
    margin: 0;
    font-size: 58px;
    font-weight: 800;
    letter-spacing: -1.5px;
    line-height: 1;
    color: #fafafa;
    text-shadow: 0 0 30px rgba(155, 188, 15, 0.15);
  }

  .ln-tagline {
    margin: 0;
    font-size: 22px;
    font-weight: 500;
    letter-spacing: 0.3px;
    color: #d4d4d8;
  }

  .ln-role {
    color: #fafafa;
  }
  .ln-dot {
    color: #52525b;
    margin: 0 6px;
  }
  .ln-ai {
    color: #9bbc0f;
    text-shadow: 0 0 14px rgba(155, 188, 15, 0.35);
  }

  .terminal--ln {
    font-size: 18px;
    line-height: 1.55;
    color: #d4d4d8;
    margin: 0;
    padding: 16px 22px;
    border: 1px solid rgba(155, 188, 15, 0.3);
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.55);
    box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.4) inset;
    backdrop-filter: blur(2px);
    white-space: pre;
    overflow: hidden;
    align-self: flex-start;
    width: 100%;
    max-width: 720px;
  }

  .ln-contact {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 14px;
    font-size: 16px;
    color: #d4d4d8;
  }
  .ln-contact-item {
    display: inline-flex;
    gap: 8px;
    align-items: baseline;
  }
  .ln-key {
    color: #9bbc0f;
    font-weight: 600;
  }
  .ln-sep {
    color: #3f3f46;
  }

  /* ───────── Kofi banner ───────── */
  .banner--kofi {
    background:
      radial-gradient(circle at 18% 50%, rgba(155, 188, 15, 0.18), transparent 55%),
      radial-gradient(circle at 88% 80%, rgba(48, 98, 48, 0.25), transparent 60%),
      linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
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
    font-size: 96px;
    font-weight: 800;
    letter-spacing: -2px;
    color: #fafafa;
  }

  .accent {
    font-size: 26px;
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
</style>
