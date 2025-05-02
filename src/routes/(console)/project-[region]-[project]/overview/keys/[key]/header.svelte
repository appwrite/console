<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';

    const projectId = page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`${base}/project-${$page.params.region}-${projectId}/overview/keys`}>
            {$key?.name}
        </CoverTitle>
        <Id value={$key?.secret}>API key secret</Id>
    </svelte:fragment>
</Cover>
