<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { Play, Pause, RotateCcw } from '@lucide/svelte';
  import { tt } from '$lib/i18n';

  const GRID = 25;
  const CELL = 24;
  const SIZE = GRID * CELL; // 600
  const TICK_BASE = 130;

  const dispatch = createEventDispatcher<{ gameover: { score: number } }>();
  export let onGameOver: (score: number) => void = () => {};

  type Cell = { x: number; y: number };
  type Bomb = Cell & { expires: number };

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let snake: Cell[] = [];
  let dir: Cell = { x: 1, y: 0 };
  let nextDir: Cell = { x: 1, y: 0 };
  let food: Cell = { x: 10, y: 10 };
  let bombs: Bomb[] = [];
  let alive = true;
  let paused = false;
  let score = 0;
  let highScore = 0;
  let speed = TICK_BASE;
  let rafId: number | null = null;
  let lastTick = 0;
  let bombTimer = 0;
  let reported = false;

  function reset() {
    snake = [
      { x: 8, y: 12 },
      { x: 7, y: 12 },
      { x: 6, y: 12 }
    ];
    dir = { x: 1, y: 0 };
    nextDir = { x: 1, y: 0 };
    bombs = [];
    bombTimer = 0;
    placeFood();
    alive = true;
    paused = false;
    score = 0;
    speed = TICK_BASE;
    lastTick = performance.now();
    reported = false;
  }

  function occupied(x: number, y: number) {
    return (
      snake.some((s) => s.x === x && s.y === y) ||
      (food.x === x && food.y === y) ||
      bombs.some((b) => b.x === x && b.y === y)
    );
  }

  function placeFood() {
    while (true) {
      const f = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
      if (!occupied(f.x, f.y)) {
        food = f;
        return;
      }
    }
  }

  function maxBombs(): number {
    return Math.min(5, 1 + Math.floor(score / 6));
  }
  function bombLifetime(): number {
    // shrinks from 8s to ~3.5s as score grows
    return Math.max(3500, 8000 - score * 200);
  }
  function bombSpawnInterval(): number {
    // frames between spawn attempts — shrinks with score
    return Math.max(80, 220 - score * 6);
  }

  function spawnBomb() {
    if (bombs.length >= maxBombs()) return;
    for (let i = 0; i < 30; i++) {
      const x = Math.floor(Math.random() * GRID);
      const y = Math.floor(Math.random() * GRID);
      // don't spawn directly in front of the snake's head
      const head = snake[0];
      const aheadX = (head.x + dir.x + GRID) % GRID;
      const aheadY = (head.y + dir.y + GRID) % GRID;
      if (x === aheadX && y === aheadY) continue;
      if (!occupied(x, y)) {
        bombs = [...bombs, { x, y, expires: performance.now() + bombLifetime() }];
        return;
      }
    }
  }

  function tick(now: number) {
    dir = nextDir;
    const head = { x: (snake[0].x + dir.x + GRID) % GRID, y: (snake[0].y + dir.y + GRID) % GRID };

    // self-collision
    if (snake.some((s) => s.x === head.x && s.y === head.y)) {
      die();
      return;
    }
    // bomb collision
    if (bombs.some((b) => b.x === head.x && b.y === head.y)) {
      die();
      return;
    }
    snake = [head, ...snake];
    if (head.x === food.x && head.y === food.y) {
      score += 1;
      speed = Math.max(55, TICK_BASE - score * 3);
      placeFood();
    } else {
      snake.pop();
    }

    // bombs: expire
    bombs = bombs.filter((b) => b.expires > now);

    // bombs: maybe spawn
    bombTimer += 1;
    if (bombTimer >= bombSpawnInterval()) {
      bombTimer = 0;
      spawnBomb();
    }
  }

  function die() {
    alive = false;
    if (!reported) {
      reported = true;
      highScore = Math.max(highScore, score);
      try {
        localStorage.setItem('snake-hi', String(highScore));
      } catch {}
      onGameOver(score);
      dispatch('gameover', { score });
    }
  }

  function draw(now: number) {
    if (!ctx) return;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, SIZE, SIZE);

    // grid dots
    ctx.fillStyle = 'rgba(155,188,15,0.06)';
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        ctx.fillRect(i * CELL + CELL / 2 - 1, j * CELL + CELL / 2 - 1, 2, 2);
      }
    }

    // food
    ctx.fillStyle = '#facc15';
    ctx.fillRect(food.x * CELL + 4, food.y * CELL + 4, CELL - 8, CELL - 8);

    // bombs (blink as expiration nears)
    for (const b of bombs) {
      const remaining = b.expires - now;
      const blinkFast = remaining < 1500;
      const visible = !blinkFast || Math.floor(now / 120) % 2 === 0;
      if (!visible) continue;
      const cx = b.x * CELL + CELL / 2;
      const cy = b.y * CELL + CELL / 2;
      // body
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(b.x * CELL + 3, b.y * CELL + 3, CELL - 6, CELL - 6);
      // fuse spark (pulsing)
      ctx.fillStyle = '#facc15';
      const sparkSize = 3 + (Math.floor(now / 100) % 2) * 2;
      ctx.fillRect(cx - sparkSize / 2, b.y * CELL + 2, sparkSize, sparkSize);
    }

    // snake
    for (let i = 0; i < snake.length; i++) {
      const s = snake[i];
      const t = 1 - i / snake.length;
      ctx.fillStyle = i === 0 ? '#9bbc0f' : `rgba(155,188,15,${0.4 + t * 0.4})`;
      ctx.fillRect(s.x * CELL + 1, s.y * CELL + 1, CELL - 2, CELL - 2);
    }

    if (!alive) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', SIZE / 2, SIZE / 2 - 12);
      ctx.fillStyle = '#a1a1aa';
      ctx.font = '16px "Geist Mono", monospace';
      ctx.fillText(`score: ${score}`, SIZE / 2, SIZE / 2 + 18);
      ctx.font = '12px "Geist Mono", monospace';
      ctx.fillStyle = '#71717a';
      ctx.fillText($tt({ pt: 'aperte SPACE ou R pra recomeçar', en: 'press SPACE or R to restart' }), SIZE / 2, SIZE / 2 + 42);
    } else if (paused) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PAUSED', SIZE / 2, SIZE / 2);
    }
  }

  function loop(t: number) {
    if (!alive || paused) {
      draw(t);
      rafId = requestAnimationFrame(loop);
      return;
    }
    if (t - lastTick >= speed) {
      tick(t);
      lastTick = t;
    }
    draw(t);
    rafId = requestAnimationFrame(loop);
  }

  function onKey(e: KeyboardEvent) {
    const key = e.key;
    if (key === ' ') {
      e.preventDefault();
      if (!alive) reset();
      else paused = !paused;
      return;
    }
    if (key === 'r' || key === 'R') {
      reset();
      return;
    }
    const map: Record<string, Cell> = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 }
    };
    const nd = map[key];
    if (!nd) return;
    if (nd.x === -dir.x && nd.y === -dir.y) return;
    nextDir = nd;
  }

  function btn(d: Cell) {
    if (!alive) return reset();
    if (d.x === -dir.x && d.y === -dir.y) return;
    nextDir = d;
  }

  onMount(() => {
    ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = SIZE * dpr;
    canvas.height = SIZE * dpr;
    ctx.scale(dpr, dpr);
    try {
      highScore = Number(localStorage.getItem('snake-hi') ?? 0) || 0;
    } catch {}
    reset();
    rafId = requestAnimationFrame(loop);
    window.addEventListener('keydown', onKey);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
    };
  });
</script>

<div class="flex w-full flex-col items-center gap-4">
  <div class="flex w-full max-w-[600px] items-center justify-between font-mono text-sm">
    <p class="text-zinc-400">score: <span class="text-[color:var(--color-gb-light)]">{score}</span></p>
    <p class="text-zinc-500">bombs: <span class="text-rose-400">{bombs.length}/{maxBombs()}</span></p>
    <p class="text-zinc-500">hi: {highScore}</p>
    <div class="flex items-center gap-1">
      <button
        type="button"
        class="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600"
        on:click={() => (!alive ? reset() : (paused = !paused))}
        aria-label={paused ? 'play' : 'pause'}
      >
        {#if !alive}
          <RotateCcw class="h-3.5 w-3.5" />
        {:else if paused}
          <Play class="h-3.5 w-3.5" />
        {:else}
          <Pause class="h-3.5 w-3.5" />
        {/if}
      </button>
      <button
        type="button"
        class="rounded-full border border-zinc-800 bg-zinc-900 p-2 text-zinc-300 hover:border-zinc-600"
        on:click={reset}
        aria-label="reset"
      >
        <RotateCcw class="h-3.5 w-3.5" />
      </button>
    </div>
  </div>

  <canvas
    bind:this={canvas}
    class="game-canvas rounded-xl border border-zinc-800 bg-zinc-950 shadow-[0_0_80px_-20px_rgba(155,188,15,0.55)]"
    style:aspect-ratio="1 / 1"
    aria-label="snake game"
  ></canvas>

  <p class="max-w-md text-center text-xs text-zinc-500">
    {$tt({ pt: 'pega', en: 'eat' })} <span class="text-amber-300">{$tt({ pt: 'frutas', en: 'fruit' })}</span> · {$tt({ pt: 'evita', en: 'avoid' })} <span class="text-rose-400">{$tt({ pt: 'bombas', en: 'bombs' })}</span> ({$tt({ pt: 'somem sozinhas', en: 'they expire on their own' })})<br />
    {$tt({ pt: 'setas', en: 'arrows' })} / WASD · <kbd class="rounded border border-zinc-700 px-1">space</kbd> {$tt({ pt: 'pausa', en: 'pause' })} · <kbd class="rounded border border-zinc-700 px-1">R</kbd> reset
  </p>

  <div class="grid grid-cols-3 gap-1 sm:hidden">
    <span></span>
    <button class="touch-btn" on:touchstart|preventDefault={() => btn({ x: 0, y: -1 })} aria-label="up">▲</button>
    <span></span>
    <button class="touch-btn" on:touchstart|preventDefault={() => btn({ x: -1, y: 0 })} aria-label="left">◀</button>
    <button class="touch-btn" on:touchstart|preventDefault={() => (!alive ? reset() : (paused = !paused))} aria-label="pause">{paused ? '▶' : '||'}</button>
    <button class="touch-btn" on:touchstart|preventDefault={() => btn({ x: 1, y: 0 })} aria-label="right">▶</button>
    <span></span>
    <button class="touch-btn" on:touchstart|preventDefault={() => btn({ x: 0, y: 1 })} aria-label="down">▼</button>
    <span></span>
  </div>
</div>

<style>
  .game-canvas {
    width: 100%;
    max-width: 600px;
    height: auto;
  }
  :global(.touch-btn) {
    border-radius: 0.375rem;
    border: 1px solid rgb(39 39 42);
    background: rgb(24 24 27);
    padding: 0.85rem 1.1rem;
    font-size: 1.125rem;
    color: var(--color-gb-light);
    touch-action: manipulation;
  }
</style>
