<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import Container from '$lib/layout/container.svelte';
    import View from '$routes/(console)/project-[region]-[project]/databases/view.svelte';
    let { data } = $props();

    const getDatabaseUrl = (database: Models.Database, firstTableId?: string | null) => {
        const tableSegment = firstTableId ? `/table-${firstTableId}` : '';
        return `${base}/embed/project-${page.params.region}-${page.params.project}/databases/database-${database.$id}${tableSegment}`;
    };
</script>

<Container>
    <View
        databases={data.databases}
        tables={data.tables}
        policies={data.policies}
        lastBackups={data.lastBackups}
        limit={data.limit}
        offset={data.offset}
        view={data.view}
        search={data.search}
        canWriteDatabases={true}
        {getDatabaseUrl} />
</Container>
