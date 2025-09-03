<script lang="ts">
    import { Layout } from '@appwrite.io/pink-svelte';
    import FilePage from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/file-[file]/+page.svelte';

    let { data } = $props();
</script>

<Layout.Stack>
    <FilePage {data} />
</Layout.Stack>
