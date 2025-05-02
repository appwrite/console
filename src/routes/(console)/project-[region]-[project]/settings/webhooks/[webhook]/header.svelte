<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { webhook } from './store';

    const projectId = page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${$page.params.region}-${projectId}/settings/webhooks`}>
            {$webhook?.name}
        </CoverTitle>
        <Id value={$webhook?.$id} event="webhook">{$webhook?.$id}</Id>
    </svelte:fragment>
</Cover>
