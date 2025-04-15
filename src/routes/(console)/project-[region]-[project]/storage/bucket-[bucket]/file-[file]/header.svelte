<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { file } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${$page.params.region}-${projectId}/storage/bucket-${bucketId}`}>
            {$file?.name}
        </CoverTitle>
        <Id value={$file?.$id} event="file">{$file?.$id}</Id>
    </svelte:fragment>
</Cover>
