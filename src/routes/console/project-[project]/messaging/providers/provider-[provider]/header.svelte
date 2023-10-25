<script lang="ts">
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { provider } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/messaging/providers`}>
            {$provider?.name ? $provider?.name : '-'}
        </CoverTitle>
        <Id value={$provider?.$id} event="provider">{$provider?.$id}</Id>
    </svelte:fragment>
</Cover>
