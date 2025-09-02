<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/databases/database-[database]/view.svelte';
    let { data } = $props();

    const createTableUrl = (table) => {
        return `${base}/embed/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${table.$id}`;
    };
</script>

<Layout.Stack>
    <View
        tables={data.tables}
        limit={data.limit}
        offset={data.offset}
        view={data.view}
        search={data.search}
        {createTableUrl}
    />
</Layout.Stack>