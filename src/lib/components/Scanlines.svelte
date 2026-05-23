<script lang="ts">
  export let intensity: 'soft' | 'medium' = 'soft';

  const dotsBg =
    'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0px, rgba(0,0,0,0.6) 1px, transparent 1px, transparent 3px)';
  const sweepBg =
    'linear-gradient(to bottom, transparent 0%, rgba(155,188,15,0.04) 50%, transparent 100%)';
</script>

<div
  aria-hidden="true"
  class="pointer-events-none fixed inset-0 z-30 mix-blend-overlay"
  style:opacity={intensity === 'soft' ? 0.18 : 0.32}
  style:background={dotsBg}
></div>
<div
  aria-hidden="true"
  class="animate-[scanline_8s_linear_infinite] pointer-events-none fixed inset-0 z-30"
  style:background={sweepBg}
  style:height="200%"
></div>
