<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
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
        <Copy value={$file?.$id} event="file">
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                File ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
