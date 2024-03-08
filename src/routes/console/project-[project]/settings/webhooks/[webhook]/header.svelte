<script lang="ts">
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { webhook } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/settings/webhooks`}>
            {$webhook?.name}
        </CoverTitle>
        <Id value={$webhook?.$id} event="webhook">Webhook ID</Id>
    </svelte:fragment>
</Cover>
