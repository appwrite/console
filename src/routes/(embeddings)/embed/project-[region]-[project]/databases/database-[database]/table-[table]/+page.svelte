<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import TablePage from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/+page.svelte';
    let { data } = $props();
</script>

<Layout.Stack>
    <TablePage {data} />
</Layout.Stack>
