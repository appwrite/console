<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { provider } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${$page.params.region}-${projectId}/messaging/providers`}>
            {$provider?.name ? $provider?.name : '-'}
        </CoverTitle>
        <Id value={$provider?.$id} event="provider">{$provider?.$id}</Id>
    </svelte:fragment>
</Cover>
