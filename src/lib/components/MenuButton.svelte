<script lang="ts">
  export let href: string;
  export let label: string;
  export let hint: string = '';
  export let badge: string = '';
  export let index: number = 0;
  export let icon: string = '▶';
  export let dataAttr: string = '';
</script>

<a
  {href}
  data-menu-item={dataAttr || undefined}
  class="menu-btn group relative block overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/60 px-5 py-4 transition-all duration-200 hover:border-[color:var(--color-gb-green)]/60 hover:bg-zinc-900/80 hover:translate-x-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-gb-green)]"
  style:animation-delay="{index * 80}ms"
>
  <div class="flex items-center gap-4">
    <span class="font-pixel text-[10px] text-zinc-600 transition-colors group-hover:text-[color:var(--color-gb-light)]">
      {String(index + 1).padStart(2, '0')}
    </span>
    <span class="font-pixel text-xs text-[color:var(--color-gb-light)] glow-green transition-transform group-hover:translate-x-0.5 sm:text-sm">
      {label}
    </span>
    {#if badge}
      <span class="ml-auto rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
        {badge}
      </span>
    {/if}
    <span
      class="ml-auto inline-block text-zinc-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[color:var(--color-gb-light)]"
      class:hidden={!!badge}
    >
      {icon}
    </span>
  </div>
  {#if hint}
    <p class="mt-1 pl-10 text-xs text-zinc-500 transition-colors group-hover:text-zinc-300">
      {hint}
    </p>
  {/if}

  <span
    aria-hidden="true"
    class="absolute inset-y-0 left-0 w-0.5 origin-top scale-y-0 bg-[color:var(--color-gb-green)] transition-transform duration-300 group-hover:scale-y-100"
  ></span>
</a>

<style>
  .menu-btn {
    animation: btn-in 0.5s ease-out backwards;
  }
  @keyframes btn-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }
</style>
