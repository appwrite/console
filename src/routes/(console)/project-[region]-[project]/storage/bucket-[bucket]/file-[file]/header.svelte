<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { file } from './store';

    const projectId = page.params.project;
    const bucketId = page.params.bucket;
    export let back = `${base}/project-${page.params.region}-${projectId}/storage/bucket-${bucketId}`;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={back}>
            {$file?.name}
        </CoverTitle>
        <Id value={$file?.$id} event="file">{$file?.$id}</Id>
    </svelte:fragment>
</Cover>
