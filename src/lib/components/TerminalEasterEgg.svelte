<script lang="ts">
  import { onMount, tick } from 'svelte';
  import { fade } from 'svelte/transition';
  import Terminal from './Terminal.svelte';
  import type { Resume } from '$lib/data/types';

  export let resume: Resume;

  let open = false;
  let buffer = '';
  let terminalEl: Terminal | undefined;

  async function show() {
    open = true;
    await tick();
    terminalEl?.focusInput?.();
  }
  function close() {
    open = false;
  }

  /** Listen for global hotkeys that open the modal: `?`, Cmd/Ctrl+K, or typing `whoami`. */
  onMount(() => {
    const onKey = (e: KeyboardEvent) => {
      if (open) {
        if (e.key === 'Escape') close();
        return;
      }

      // Cmd+K / Ctrl+K works *anywhere* — including inside other inputs, like
      // most command-palette shortcuts.
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        show();
        return;
      }

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      if (e.key === '?') {
        // prevent the `?` from ending up inside the terminal input that we're
        // about to focus
        e.preventDefault();
        show();
        return;
      }

      if (e.key.length === 1) buffer = (buffer + e.key.toLowerCase()).slice(-12);
      if (buffer.endsWith('whoami')) {
        e.preventDefault();
        show();
        setTimeout(() => terminalEl?.runCommand('whoami'), 50);
        buffer = '';
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  function onNavigate() {
    close();
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 p-4 backdrop-blur"
    transition:fade={{ duration: 150 }}
    on:click|self={close}
    on:keydown|self={(e) => e.key === 'Escape' && close()}
    role="dialog"
    tabindex="-1"
    aria-modal="true"
  >
    <div class="w-full max-w-3xl">
      <Terminal
        bind:this={terminalEl}
        {resume}
        inModal
        on:close={close}
        on:navigate={onNavigate}
      />
    </div>
  </div>
{/if}
