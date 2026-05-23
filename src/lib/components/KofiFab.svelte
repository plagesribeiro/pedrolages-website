<script lang="ts">
  import { tt } from '$lib/i18n';
  import { Coffee } from '@lucide/svelte';

  export let href: string;
</script>

<a
  {href}
  target="_blank"
  rel="noopener"
  aria-label={$tt({ pt: 'me pagar um café', en: 'buy me a coffee' })}
  class="kofi-fab group"
>
  <Coffee class="h-4 w-4" />
  <span class="font-pixel text-[10px]">ko-fi</span>
</a>

<style>
  .kofi-fab {
    position: fixed;
    right: 1.25rem;
    bottom: 1.25rem;
    z-index: 40;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 9999px;
    border: 1px solid rgba(251, 191, 36, 0.4);
    background: rgba(251, 191, 36, 0.1);
    backdrop-filter: blur(8px);
    color: rgb(252 211 77);
    padding: 0.55rem 0.9rem;
    box-shadow: 0 8px 24px -12px rgba(251, 191, 36, 0.35);
    transition:
      transform 200ms ease-out,
      box-shadow 200ms ease-out,
      background 200ms ease-out;
    animation: kofi-pop 0.5s ease-out 0.6s backwards;
  }
  .kofi-fab:hover {
    transform: scale(1.06);
    background: rgba(251, 191, 36, 0.18);
    box-shadow: 0 10px 28px -10px rgba(251, 191, 36, 0.5);
  }
  .kofi-fab:focus-visible {
    outline: none;
    box-shadow:
      0 0 0 2px rgba(252, 211, 77, 0.6),
      0 8px 24px -12px rgba(251, 191, 36, 0.35);
  }
  @keyframes kofi-pop {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .kofi-fab {
      animation: none;
      transition: none;
    }
  }
</style>
