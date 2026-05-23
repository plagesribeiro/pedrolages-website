<script lang="ts">
  import Self from './Tree.svelte';
  import type { ContentItem } from '$lib/content/manifest';
  import { FileText, Folder as FolderIcon, ChevronRight } from '@lucide/svelte';

  export let items: ContentItem[];
  /** Folder path of the current node, e.g. "notas" or "" for root. */
  export let basePath: string = '';
  /** URL prefix, e.g. "/md" or "/md/notas". */
  export let baseUrl: string;
  export let depth: number = 0;

  $: directFiles = items.filter((i) => i.folder === basePath).sort((a, b) => a.name.localeCompare(b.name));

  $: subFolders = (() => {
    const prefix = basePath ? basePath + '/' : '';
    const seen = new Map<string, ContentItem[]>();
    for (const item of items) {
      if (item.folder === basePath) continue;
      if (basePath && !(item.folder === basePath || item.folder.startsWith(prefix))) continue;
      if (!basePath && !item.folder) continue;
      const rest = item.folder.slice(prefix.length);
      const firstSeg = rest.split('/')[0];
      if (!firstSeg) continue;
      const subPath = (basePath ? basePath + '/' : '') + firstSeg;
      const subItems = items.filter((i) => i.folder === subPath || i.folder.startsWith(subPath + '/'));
      seen.set(firstSeg, subItems);
    }
    return [...seen.entries()].sort(([a], [b]) => a.localeCompare(b));
  })();

  let openSet = new Set<string>();
  function toggle(name: string) {
    if (openSet.has(name)) openSet.delete(name);
    else openSet.add(name);
    openSet = openSet;
  }
</script>

<ul class="space-y-1.5">
  {#each subFolders as [name, subItems]}
    {@const subPath = (basePath ? basePath + '/' : '') + name}
    {@const subUrl = `${baseUrl}/${name}`}
    {@const isOpen = openSet.has(name)}
    <li>
      <div class="folder-row group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 transition hover:border-zinc-700">
        <button
          type="button"
          on:click={() => toggle(name)}
          aria-expanded={isOpen}
          aria-label={isOpen ? 'collapse' : 'expand'}
          class="grid h-6 w-6 place-items-center rounded text-zinc-500 hover:bg-zinc-800 hover:text-zinc-100"
        >
          <ChevronRight
            class="h-3.5 w-3.5 transition-transform"
            style={isOpen ? 'transform: rotate(90deg);' : ''}
          />
        </button>
        <FolderIcon class="h-4 w-4 text-amber-300/70" />
        <a
          href={subUrl}
          class="flex-1 font-mono text-sm text-zinc-200 hover:text-[color:var(--color-gb-light)]"
        >
          {name}/
        </a>
        <span class="text-xs font-mono text-zinc-600">{subItems.length}</span>
      </div>
      {#if isOpen}
        <div class="mt-1.5 ml-3 border-l border-zinc-800 pl-3">
          <Self items={subItems} basePath={subPath} baseUrl={subUrl} depth={depth + 1} />
        </div>
      {/if}
    </li>
  {/each}

  {#each directFiles as item}
    <li>
      <a
        href={item.url}
        class="group flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 transition hover:border-[color:var(--color-gb-green)]/40 hover:bg-zinc-900/60"
      >
        <span class="grid h-6 w-6 place-items-center text-zinc-700"></span>
        <FileText class="h-4 w-4 text-zinc-500 group-hover:text-[color:var(--color-gb-light)]" />
        <span class="flex-1 font-mono text-sm text-zinc-300 group-hover:text-zinc-100">{item.name}</span>
      </a>
    </li>
  {/each}
</ul>
