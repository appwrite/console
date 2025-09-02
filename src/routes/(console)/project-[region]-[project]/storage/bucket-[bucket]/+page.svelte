<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Container } from '$lib/layout';
    import View from './view.svelte';
    export let data;

    const createFileUrl = (file: Models.File) => {
        return `${base}/project-${page.params.region}-${page.params.project}/storage/bucket-${page.params.bucket}/file-${file.$id}`;
    };
</script>

<Container>
    <View
        files={data.files}
        limit={data.limit}
        offset={data.offset}
        search={data.search}
        {createFileUrl}
    />
</Container>
