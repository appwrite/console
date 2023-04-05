<script lang="ts">
    import { page } from '$app/stores';
    import { ID } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { file } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/storage/bucket-${bucketId}`}>
            {$file?.name}
        </CoverTitle>
        <ID value={$file?.$id} event="file">{$file?.$id}</ID>
    </svelte:fragment>
</Cover>
