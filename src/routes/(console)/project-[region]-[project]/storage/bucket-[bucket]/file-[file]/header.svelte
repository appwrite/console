<script lang="ts">
    import { file } from './store';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    const bucketId = page.params.bucket;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute(`/storage/bucket-${bucketId}`)}>
            {$file?.name}
        </CoverTitle>
        <Id value={$file?.$id} event="file">{$file?.$id}</Id>
    </svelte:fragment>
</Cover>
