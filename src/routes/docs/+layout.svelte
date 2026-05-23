<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { invalidateAll } from '$app/navigation';
  import { browser } from '$app/environment';

  const POLL_MS = 5000;

  let lastTag: string | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let aborted = false;

  async function checkOnce() {
    try {
      const res = await fetch('/api/manifest-version', { cache: 'no-store' });
      if (!res.ok) return;
      const { revisionTag } = (await res.json()) as { revisionTag: string };
      if (lastTag === null) {
        lastTag = revisionTag;
        return;
      }
      if (revisionTag !== lastTag) {
        lastTag = revisionTag;
        await invalidateAll();
      }
    } catch {
      /* swallow — next tick tries again */
    }
  }

  function schedule() {
    if (aborted) return;
    timer = setTimeout(async () => {
      if (document.visibilityState === 'visible') await checkOnce();
      schedule();
    }, POLL_MS);
  }

  function onVisibility() {
    if (document.visibilityState === 'visible') void checkOnce();
  }

  onMount(() => {
    if (!browser) return;
    void checkOnce();
    schedule();
    document.addEventListener('visibilitychange', onVisibility);
  });

  onDestroy(() => {
    aborted = true;
    if (timer) clearTimeout(timer);
    if (browser) document.removeEventListener('visibilitychange', onVisibility);
  });
</script>

<slot />
