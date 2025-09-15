<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/databases/database-[database]/table-[table]/view.svelte';
    let { data } = $props();
</script>

<Layout.Stack>
    <View {data} />
</Layout.Stack>
