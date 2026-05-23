import type { Action } from 'svelte/action';

/** Svelte action: adds `is-visible` class once the element enters the viewport. */
export const reveal: Action<HTMLElement, { threshold?: number; once?: boolean } | undefined> = (
  node,
  options = {}
) => {
  const { threshold = 0.15, once = true } = options;
  if (typeof IntersectionObserver === 'undefined') {
    node.classList.add('is-visible');
    return;
  }
  node.classList.add('reveal-init');
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          if (once) io.unobserve(node);
        } else if (!once) {
          node.classList.remove('is-visible');
        }
      }
    },
    { threshold }
  );
  io.observe(node);
  return {
    destroy() {
      io.disconnect();
    }
  };
};
