<script lang="ts">
    import { page } from '$app/stores';
    import { Copy } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Cover, CoverTitle } from '$lib/layout';
    import { webhook } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/settings/webhooks`}>
            {$webhook?.name}
        </CoverTitle>
        <Copy value={$webhook?.$id} event="webhook">
            <Pill button>
                <span class="icon-duplicate" aria-hidden="true" />
                Webhook ID
            </Pill>
        </Copy>
    </svelte:fragment>
</Cover>
