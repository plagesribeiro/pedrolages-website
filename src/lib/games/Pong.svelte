<script lang="ts">
  import { onMount } from 'svelte';
  import { RotateCcw } from '@lucide/svelte';
  import { tt, locale } from '$lib/i18n';

  export let onGameOver: (winner: 'you' | 'ai', score: number) => void = () => {};

  $: lang = $locale;

  const W = 720;
  const H = 420;
  const PADDLE_W = 10;
  const PADDLE_H = 80;
  const PADDLE_SPEED = 6;
  const BALL_SIZE = 10;
  // AI difficulty knobs — humans should win sometimes.
  const AI_LAG = 0.045;
  const AI_MAX_SPEED = 3.0;
  const AI_DEADZONE = 8; // doesn't bother moving for tiny offsets
  const AI_OFFSET_NOISE = 28; // misjudges by up to this many px
  const BALL_START = 1.7;
  const HIT_BOOST = 1.04;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let playerY = H / 2 - PADDLE_H / 2;
  let aiY = H / 2 - PADDLE_H / 2;
  let aiOffset = 0;
  let ball = { x: W / 2, y: H / 2, vx: BALL_START, vy: 0.8 };
  let scorePlayer = 0;
  let scoreAi = 0;
  let rafId: number | null = null;
  let mouseY: number | null = null;
  let upPressed = false;
  let downPressed = false;
  let winner: 'you' | 'ai' | null = null;
  let serveCountdown = 0;

  function reset(serveDir: 1 | -1 = 1) {
    ball = {
      x: W / 2,
      y: H / 2,
      vx: BALL_START * serveDir,
      vy: (Math.random() - 0.5) * 1.5
    };
    aiOffset = (Math.random() - 0.5) * 2 * AI_OFFSET_NOISE;
    serveCountdown = 75; // ~1.25s pause before the ball moves
  }

  function newMatch() {
    scorePlayer = 0;
    scoreAi = 0;
    winner = null;
    reset(1);
  }

  function update() {
    if (winner) return;

    // keyboard wins over mouse if pressed
    if (upPressed || downPressed) {
      if (upPressed) playerY -= PADDLE_SPEED;
      if (downPressed) playerY += PADDLE_SPEED;
    } else if (mouseY != null) {
      const target = mouseY - PADDLE_H / 2;
      playerY += (target - playerY) * 0.32;
    }
    playerY = Math.max(0, Math.min(H - PADDLE_H, playerY));

    // Easier AI:
    //  - only chases when the ball is coming toward it
    //  - drifts back to center when the ball is on the player's side
    //  - has a max speed, so it can't snap
    //  - aims with a noisy offset that re-rolls each volley
    const sharpness = Math.min(0.025, (scorePlayer + scoreAi) * 0.003);
    const idleY = H / 2 - PADDLE_H / 2;
    const targetY = ball.vx > 0 ? ball.y - PADDLE_H / 2 + aiOffset : idleY;
    const delta = targetY - aiY;
    if (Math.abs(delta) > AI_DEADZONE) {
      const desired = delta * (AI_LAG + sharpness);
      const step = Math.max(-AI_MAX_SPEED, Math.min(AI_MAX_SPEED, desired));
      aiY += step;
    }
    aiY = Math.max(0, Math.min(H - PADDLE_H, aiY));

    // serve pause — paddles can still move, ball waits
    if (serveCountdown > 0) {
      serveCountdown -= 1;
      return;
    }

    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y < 0 || ball.y > H - BALL_SIZE) ball.vy *= -1;

    // player paddle (left)
    if (
      ball.x < 14 + PADDLE_W &&
      ball.x > 14 - BALL_SIZE &&
      ball.y > playerY - BALL_SIZE &&
      ball.y < playerY + PADDLE_H
    ) {
      ball.x = 14 + PADDLE_W;
      ball.vx = Math.abs(ball.vx) * HIT_BOOST;
      const rel = (ball.y - (playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
      ball.vy = rel * 3.5;
    }

    // ai paddle (right)
    if (
      ball.x > W - 14 - PADDLE_W - BALL_SIZE &&
      ball.x < W - 14 &&
      ball.y > aiY - BALL_SIZE &&
      ball.y < aiY + PADDLE_H
    ) {
      ball.x = W - 14 - PADDLE_W - BALL_SIZE;
      ball.vx = -Math.abs(ball.vx) * HIT_BOOST;
      const rel = (ball.y - (aiY + PADDLE_H / 2)) / (PADDLE_H / 2);
      ball.vy = rel * 3.5;
    }

    if (ball.x < -BALL_SIZE) {
      scoreAi += 1;
      if (scoreAi >= 5) {
        winner = 'ai';
        onGameOver('ai', scorePlayer);
      } else reset(1);
    } else if (ball.x > W) {
      scorePlayer += 1;
      if (scorePlayer >= 5) {
        winner = 'you';
        onGameOver('you', scorePlayer);
      } else reset(-1);
    }
  }

  function draw() {
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, W, H);

    // center dashed line
    ctx.fillStyle = 'rgba(155,188,15,0.18)';
    for (let y = 4; y < H; y += 14) ctx.fillRect(W / 2 - 1, y, 2, 8);

    // paddles
    ctx.fillStyle = '#9bbc0f';
    ctx.fillRect(14, playerY, PADDLE_W, PADDLE_H);
    ctx.fillStyle = '#facc15';
    ctx.fillRect(W - 14 - PADDLE_W, aiY, PADDLE_W, PADDLE_H);

    // ball — blinks during serve countdown
    if (serveCountdown > 0 && Math.floor(serveCountdown / 8) % 2 === 0) {
      ctx.fillStyle = '#9bbc0f';
    } else {
      ctx.fillStyle = '#fafafa';
    }
    ctx.fillRect(ball.x, ball.y, BALL_SIZE, BALL_SIZE);

    // scores
    ctx.font = 'bold 28px "Press Start 2P", monospace';
    ctx.fillStyle = '#9bbc0f';
    ctx.textAlign = 'center';
    ctx.fillText(String(scorePlayer), W / 2 - 40, 36);
    ctx.fillStyle = '#facc15';
    ctx.fillText(String(scoreAi), W / 2 + 40, 36);

    if (winner) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = winner === 'you' ? '#9bbc0f' : '#f43f5e';
      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      const winText =
        winner === 'you'
          ? lang === 'pt'
            ? 'VOCÊ VENCEU!'
            : 'YOU WIN!'
          : lang === 'pt'
            ? 'IA VENCEU'
            : 'AI WINS';
      ctx.fillText(winText, W / 2, H / 2 - 5);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '12px "Geist Mono", monospace';
      ctx.fillText(
        lang === 'pt' ? 'aperte R ou clica em reset' : 'press R or click reset',
        W / 2,
        H / 2 + 22
      );
    }
  }

  function loop() {
    update();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function onMove(e: MouseEvent | TouchEvent) {
    const rect = canvas.getBoundingClientRect();
    const cy = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    mouseY = ((cy - rect.top) / rect.height) * H;
  }
  function onLeave() {
    mouseY = null;
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') upPressed = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') downPressed = true;
    if (e.key === 'r' || e.key === 'R') newMatch();
  }
  function onKeyUp(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') upPressed = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') downPressed = false;
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    newMatch();
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
  <div class="flex w-full max-w-[720px] items-center justify-between font-mono text-sm">
    <p class="text-zinc-400">
      you: <span class="text-[color:var(--color-gb-light)]">{scorePlayer}</span>
    </p>
    <p class="text-zinc-500">{$tt({ pt: 'primeiro a 5', en: 'first to 5' })}</p>
    <p class="text-zinc-400">ai: <span class="text-amber-300">{scoreAi}</span></p>
    <button
      class="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600"
      on:click={newMatch}
      aria-label="reset"
    >
      <RotateCcw class="h-3.5 w-3.5" />
    </button>
  </div>
  <canvas
    bind:this={canvas}
    on:mousemove={onMove}
    on:mouseleave={onLeave}
    on:touchmove|preventDefault={onMove}
    class="game-canvas touch-none rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(155,188,15,0.55)]"
    style:aspect-ratio="{W} / {H}"
    aria-label="pong game"
  ></canvas>
  <p class="text-xs text-zinc-500">
    {$tt({ pt: 'mouse / ↑ ↓ ou W/S · R = nova partida', en: 'mouse / ↑ ↓ or W/S · R = new match' })}
  </p>
</div>

<style>
  .game-canvas {
    width: 100%;
    max-width: 720px;
    height: auto;
    cursor: none;
  }
</style>
