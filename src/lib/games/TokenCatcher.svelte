<script lang="ts">
  import { onMount } from 'svelte';
  import { RotateCcw } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';

  export let onGameOver: (score: number) => void = () => {};

  $: lang = $locale;

  const W = 520;
  const H = 640;
  const PADDLE_W = 130;
  const PADDLE_H = 14;
  // gradual ramp over RAMP_SECONDS
  const RAMP_SECONDS = 35;
  const GRAVITY_START = 0.018;
  const GRAVITY_END = 0.05;
  const MAX_VY_START = 1.4;
  const MAX_VY_END = 3.6;
  const BUG_CHANCE_START = 0.1;
  const BUG_CHANCE_END = 0.3;
  const SPAWN_START = 140;
  const SPAWN_END = 48;

  type Drop = { x: number; y: number; vy: number; type: 'token' | 'bug'; rot: number };

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let paddleX = W / 2 - PADDLE_W / 2;
  let drops: Drop[] = [];
  let score = 0;
  let lives = 3;
  let highScore = 0;
  let alive = true;
  let spawnTimer = 0;
  let rafId: number | null = null;
  let mouseX: number | null = null;
  let leftPressed = false;
  let rightPressed = false;
  let gameStart = 0;
  let elapsed = 0;

  function reset() {
    drops = [];
    score = 0;
    lives = 3;
    alive = true;
    paddleX = W / 2 - PADDLE_W / 2;
    spawnTimer = 0;
    gameStart = performance.now();
    elapsed = 0;
  }

  function difficulty(): number {
    return Math.min(1, elapsed / RAMP_SECONDS);
  }
  function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
  }

  function spawn() {
    const x = 24 + Math.random() * (W - 48);
    const bugChance = lerp(BUG_CHANCE_START, BUG_CHANCE_END, difficulty());
    const isBug = Math.random() < bugChance;
    drops.push({
      x,
      y: -16,
      vy: 0.35 + Math.random() * 0.3,
      type: isBug ? 'bug' : 'token',
      rot: Math.random() * Math.PI * 2
    });
  }

  function update() {
    elapsed = (performance.now() - gameStart) / 1000;
    const d = difficulty();
    const gravity = lerp(GRAVITY_START, GRAVITY_END, d);
    const maxVy = lerp(MAX_VY_START, MAX_VY_END, d);

    // keyboard wins over mouse if pressed
    if (leftPressed) paddleX -= 7;
    if (rightPressed) paddleX += 7;
    if (!leftPressed && !rightPressed && mouseX != null) {
      const target = mouseX - PADDLE_W / 2;
      paddleX += (target - paddleX) * 0.55;
    }
    paddleX = Math.max(0, Math.min(W - PADDLE_W, paddleX));

    spawnTimer += 1;
    const interval = Math.max(SPAWN_END, Math.floor(lerp(SPAWN_START, SPAWN_END, d)));
    if (spawnTimer >= interval) {
      spawn();
      spawnTimer = 0;
    }

    for (const drop of drops) {
      drop.vy = Math.min(maxVy, drop.vy + gravity);
      drop.y += drop.vy;
      drop.rot += 0.04;
    }

    drops = drops.filter((d) => {
      if (d.y > H - PADDLE_H - 18 && d.y < H - PADDLE_H + 8 && d.x > paddleX - 10 && d.x < paddleX + PADDLE_W + 10) {
        if (d.type === 'token') {
          score += 1;
        } else {
          lives -= 1;
          if (lives <= 0) {
            alive = false;
            highScore = Math.max(highScore, score);
            try {
              localStorage.setItem('tokens-hi', String(highScore));
            } catch {}
            onGameOver(score);
          }
        }
        return false;
      }
      if (d.y > H + 30) {
        return false;
      }
      return true;
    });
  }

  function draw() {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    // starfield
    ctx.fillStyle = 'rgba(155,188,15,0.10)';
    for (let i = 0; i < 30; i++) {
      const x = (i * 73 + (performance.now() / 30) * 0.3) % W;
      const y = (i * 47) % H;
      ctx.fillRect(x, y, 1, 1);
    }

    // paddle
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(paddleX, H - PADDLE_H - 8, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(paddleX + 4, H - PADDLE_H - 8, PADDLE_W - 8, 2);

    // drops
    for (const d of drops) {
      ctx.save();
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      if (d.type === 'token') {
        ctx.fillStyle = '#9bbc0f';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = '#0a0a0a';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('tk', 0, 1);
      } else {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-7, -5, 14, 10);
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-7, -5, 2, 2);
        ctx.fillRect(5, -5, 2, 2);
      }
      ctx.restore();
    }

    // HUD
    ctx.fillStyle = '#a1a1aa';
    ctx.font = '12px "Geist Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`tokens: ${score}`, 8, 8);
    ctx.textAlign = 'center';
    const lvl = Math.floor(difficulty() * 10);
    ctx.fillStyle = '#71717a';
    ctx.fillText(lang === 'pt' ? `nível ${lvl}` : `speed lv ${lvl}`, W / 2, 8);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#f43f5e';
    ctx.fillText('❤'.repeat(Math.max(0, lives)), W - 8, 8);

    if (!alive) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 18px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(lang === 'pt' ? 'GAME OVER' : 'OUT OF LIVES', W / 2, H / 2 - 10);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '13px "Geist Mono", monospace';
      ctx.fillText(
        lang === 'pt' ? `tokens pegos: ${score}` : `tokens caught: ${score}`,
        W / 2,
        H / 2 + 18
      );
      ctx.fillText(lang === 'pt' ? 'clica ou aperta R' : 'click or press R', W / 2, H / 2 + 38);
    }
  }

  function loop() {
    if (alive) update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onMove(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const cx = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
    mouseX = ((cx - rect.left) / rect.width) * W;
  }
  function onLeave() {
    mouseX = null;
  }
  function onClick() {
    if (!alive) reset();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'r' || e.key === 'R') reset();
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = true;
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') leftPressed = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') rightPressed = false;
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    try {
      highScore = Number(localStorage.getItem('tokens-hi') ?? 0) || 0;
    } catch {}
    reset();
    rafId = requestAnimationFrame(loop);
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKeyUp);
    };
  });
</script>

<div class="flex w-full flex-col items-center gap-3">
  <div class="flex w-full max-w-[520px] items-center justify-between font-mono text-sm">
    <p class="text-zinc-400">score: <span class="text-[color:var(--color-gb-light)]">{score}</span></p>
    <p class="text-zinc-500">hi: {highScore}</p>
    <button type="button" class="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600" on:click={reset} aria-label="reset">
      <RotateCcw class="h-3.5 w-3.5" />
    </button>
  </div>
  <canvas
    bind:this={canvas}
    on:mousemove={onMove}
    on:mouseleave={onLeave}
    on:touchmove|preventDefault={onMove}
    on:click={onClick}
    class="game-canvas touch-none rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(155,188,15,0.55)]"
    style:aspect-ratio="{W} / {H}"
    aria-label="token catcher game"
  ></canvas>
  <p class="max-w-xs text-center text-xs text-zinc-500">
    {$tt({ pt: 'pega', en: 'catch' })} <span class="text-[color:var(--color-gb-light)]">tokens</span>, {$tt({ pt: 'evita', en: 'dodge' })} <span class="text-rose-400">bugs</span>. {$tt({ pt: 'acelera com o tempo.', en: 'speeds up over time.' })}<br />
    mouse · ← → / A D · R = reset
  </p>

  <div class="grid grid-cols-2 gap-2 sm:hidden">
    <button
      class="touch-pad"
      on:touchstart|preventDefault={() => (leftPressed = true)}
      on:touchend|preventDefault={() => (leftPressed = false)}
      on:touchcancel|preventDefault={() => (leftPressed = false)}
      aria-label="left"
    >◀</button>
    <button
      class="touch-pad"
      on:touchstart|preventDefault={() => (rightPressed = true)}
      on:touchend|preventDefault={() => (rightPressed = false)}
      on:touchcancel|preventDefault={() => (rightPressed = false)}
      aria-label="right"
    >▶</button>
  </div>
</div>

<style>
  .game-canvas {
    width: 100%;
    max-width: 520px;
    height: auto;
    cursor: none;
  }
  :global(.touch-pad) {
    border-radius: 0.5rem;
    border: 1px solid rgb(39 39 42);
    background: rgb(24 24 27);
    padding: 1rem 2rem;
    font-size: 1.5rem;
    color: var(--color-gb-light);
    touch-action: manipulation;
  }
</style>
