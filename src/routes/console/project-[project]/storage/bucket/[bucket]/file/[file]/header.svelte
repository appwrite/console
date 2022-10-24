<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover } from '$lib/layout';
    import { file } from './store';

    const projectId = $page.params.project;
    const bucketId = $page.params.bucket;
</script>

<Cover>
    <svelte:fragment slot="header">
        <a
            class="back-button"
            href={`/console/project-${projectId}/storage/bucket/${bucketId}`}
            aria-label="page back">
            <span class="icon-cheveron-left" aria-hidden="true" />
        </a>
        <h1 class="heading-level-4">
            <span class="text">{$file.name}</span>
        </h1>
        <Copy value={$file.$id}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                File ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
