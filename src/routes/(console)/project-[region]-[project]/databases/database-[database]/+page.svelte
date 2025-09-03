<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Container } from '$lib/layout';
    import View from './view.svelte';
    export let data;

    const createTableUrl = (table: Models.Table) => {
        return `${base}/project-${page.params.region}-${page.params.project}/databases/database-${page.params.database}/table-${table.$id}`;
    };
</script>

<Container>
    <View
        tables={data.tables}
        limit={data.limit}
        offset={data.offset}
        view={data.view}
        search={data.search}
        {createTableUrl} />
</Container>
