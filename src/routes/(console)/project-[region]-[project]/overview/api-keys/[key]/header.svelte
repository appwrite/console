<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';

    const projectId = page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${page.params.region}-${projectId}/overview/api-keys`}>
            {$key?.name}
        </CoverTitle>
    </svelte:fragment>
</Cover>
