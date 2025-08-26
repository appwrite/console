<script lang="ts">
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { deployment } from './store';
    import { getProjectRoute } from '$lib/helpers/project';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle href={getProjectRoute(`/sites/site-${page.params.site}/deployments`)}>
            Deployment
        </CoverTitle>
        <Id value={$deployment.$id}>{$deployment.$id}</Id>
    </svelte:fragment>
</Cover>
