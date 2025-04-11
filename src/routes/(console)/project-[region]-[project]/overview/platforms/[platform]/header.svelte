<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Cover, CoverTitle } from '$lib/layout';
    import { platform } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${$page.params.region}-${projectId}/overview/platforms`}>
            {$platform?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
