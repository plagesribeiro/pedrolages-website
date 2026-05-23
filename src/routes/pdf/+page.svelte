<script lang="ts">
  import ContentIndex from '$lib/components/ContentIndex.svelte';
  import type { ContentItem } from '$lib/content/manifest';
  export let data: { items: ContentItem[] };
</script>

<ContentIndex folder="pdf" title="pdfs" items={data.items} icon="pdf" />
