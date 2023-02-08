<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/overview/keys`}>
            {$key?.name}
        </CoverTitle>
        <Copy value={$key?.secret}>
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                API Key Secret
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
