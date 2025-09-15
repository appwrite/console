<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/databases/database-[database]/view.svelte';
    import CreateTable from '$routes/(console)/project-[region]-[project]/databases/database-[database]/createTable.svelte';
    import { showCreate } from '$routes/(console)/project-[region]-[project]/databases/database-[database]/store';
    import type { Models } from '@appwrite.io/console';
    import { goto } from '$app/navigation';
    let { data } = $props();

    function createTableUrl(table: Models.Table) {
        return `${base}/embed/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${table.$id}`;
    }

    async function handleCreate(event: CustomEvent<Models.Table>) {
        $showCreate = false;
        await goto(createTableUrl(event.detail));
    }
</script>

<Layout.Stack>
    <View
        canWriteTables
        tables={data.tables}
        limit={data.limit}
        offset={data.offset}
        view={data.view}
        search={data.search}
        {createTableUrl} />
</Layout.Stack>

<CreateTable bind:showCreate={$showCreate} on:created={handleCreate} />
