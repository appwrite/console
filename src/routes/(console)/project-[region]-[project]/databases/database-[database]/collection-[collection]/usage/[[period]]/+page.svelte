<script lang="ts">
    import type { PageProps } from './$types';
    import { Usage } from '$database/(entity)';

    let { data }: PageProps = $props();

    const count = $derived(data.documents);
    const total = $derived(data.documentsTotal);
</script>

<Usage {count} {total} />
