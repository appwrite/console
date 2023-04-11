<script lang="ts">
    import { page } from '$app/stores';
    import { ID } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { key } from './store';

    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/overview/keys`}>
            {$key?.name}
        </CoverTitle>
        <ID value={$key?.secret}>API Key Secret</ID>
    </svelte:fragment>
</Cover>
