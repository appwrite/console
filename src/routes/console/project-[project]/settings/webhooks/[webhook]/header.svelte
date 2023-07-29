<script lang="ts">
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';
    const projectId = $page.params.project;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/settings/webhooks`}>
            {$webhook?.name}
        </CoverTitle>
        <Id value={$webhook?.$id} event="webhook">{$LL.console.project.table.pill.webhookId()}</Id>
    </svelte:fragment>
</Cover>
