<script lang="ts">
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { deployment } from './store';
    import { Cover, CoverTitle } from '$lib/layout';
    import { getProjectRoute } from '$lib/helpers/project';

    $: functionId = page.params.function;
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute(`/functions/function-${functionId}`)}>
            Deployment
        </CoverTitle>
        <Id value={$deployment.$id}>{$deployment.$id}</Id>
    </svelte:fragment>
</Cover>
