<script lang="ts">
    import { page } from '$app/stores';
    import { Cover, CoverTitle } from '$lib/layout';
    import { platform } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/overview/platforms`}>
            {$platform?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
