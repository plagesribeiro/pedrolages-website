<script lang="ts">
  import { onMount } from 'svelte';

  export let density = 60;
  export let speed = 0.25;
  export let color = '#9bbc0f';
  export let interactive = true;

  let canvas: HTMLCanvasElement;
  let dpr = 1;
  let particles: { x: number; y: number; vx: number; vy: number; size: number; phase: number }[] =
    [];
  let mouse = { x: -9999, y: -9999 };
  let rafId: number;

  onMount(() => {
    const ctx = canvas.getContext('2d')!;
    if (!ctx) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
    }

    function spawn() {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * speed,
        vy: (Math.random() - 0.5) * speed,
        size: Math.random() > 0.85 ? 3 : Math.random() > 0.5 ? 2 : 1,
        phase: Math.random() * Math.PI * 2
      }));
    }

    function step(t: number) {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        // mouse repel
        if (interactive) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 100 * 100) {
            const force = (100 - Math.sqrt(dist2)) * 0.02;
            const ang = Math.atan2(dy, dx);
            p.vx += Math.cos(ang) * force * 0.05;
            p.vy += Math.sin(ang) * force * 0.05;
          }
        }
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx + Math.cos(t / 1000 + p.phase) * 0.02;
        p.y += p.vy + Math.sin(t / 1000 + p.phase) * 0.02;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
        const alpha = 0.35 + 0.25 * Math.sin(t / 700 + p.phase);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(step);
    }

    function onMouse(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    function onLeave() {
      mouse = { x: -9999, y: -9999 };
    }

    resize();
    spawn();
    rafId = requestAnimationFrame(step);

    const ro = new ResizeObserver(() => {
      resize();
      spawn();
    });
    ro.observe(canvas);
    window.addEventListener('mousemove', onMouse);
    window.addEventListener('mouseleave', onLeave);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('mousemove', onMouse);
      window.removeEventListener('mouseleave', onLeave);
    };
  });
</script>

<canvas bind:this={canvas} class="pointer-events-none absolute inset-0 h-full w-full"></canvas>
