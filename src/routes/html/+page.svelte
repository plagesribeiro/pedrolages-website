<script lang="ts">
  import ContentIndex from '$lib/components/ContentIndex.svelte';
  import type { ContentItem } from '$lib/content/manifest';
  export let data: { items: ContentItem[] };
</script>

<ContentIndex folder="html" title="html shares" items={data.items} icon="html" />
