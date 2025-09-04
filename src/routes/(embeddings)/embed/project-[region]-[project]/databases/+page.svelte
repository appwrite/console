<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/databases/view.svelte';
    let { data } = $props();

    const getDatabaseUrl = (database: Models.Database, firstTableId?: string | null) => {
        const tableSegment = firstTableId ? `/table-${firstTableId}` : '';
        return `${base}/embed/project-${page.params.region}-${page.params.project}/databases/database-${database.$id}${tableSegment}`;
    };
</script>

<Layout.Stack>
    <View
        databases={data?.databases || { total: 0, databases: [] }}
        tables={data?.tables || {}}
        policies={data?.policies || {}}
        lastBackups={data?.lastBackups || {}}
        limit={data?.limit || 25}
        offset={data?.offset || 0}
        view={data?.view || 'grid'}
        search={data?.search || null}
        {getDatabaseUrl} />
</Layout.Stack>
