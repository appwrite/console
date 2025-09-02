<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Layout } from '@appwrite.io/pink-svelte';
    import View from '$routes/(console)/project-[region]-[project]/storage/bucket-[bucket]/view.svelte';
    
    let { data } = $props();

    const createFileUrl = (file: Models.File) => {
        return `${base}/embed/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/file-${file.$id}`;
    };
</script>

<Layout.Stack>
    <View
        files={data?.files || { total: 0, files: [] }}
        limit={data?.limit || 25}
        offset={data?.offset || 0}
        search={data?.search || null}
        {createFileUrl}
    />
</Layout.Stack>