<script lang="ts">
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/overview/keys`}>
            {$key?.name}
        </CoverTitle>
        <Id value={$key?.secret}>API key secret</Id>
    </svelte:fragment>
</Cover>
