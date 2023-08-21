<script lang="ts">
    import { page } from '$app/stores';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { deployment } from './store';

    $: projectId = $page.params.project;
    $: functionId = $page.params.function;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={`/console/project-${projectId}/functions/function-${functionId}`}>
            Deployment details
        </CoverTitle>
        <Id value={$deployment.$id}>{$deployment.$id}</Id>
    </svelte:fragment>
</Cover>
