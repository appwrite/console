<script lang="ts">
    import { page } from '$app/stores';
    import LL from '$i18n/i18n-svelte';
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
        <Id value={$key?.secret}>{$LL.console.project.table.pill.apiKeySecret()}</Id>
    </svelte:fragment>
</Cover>
