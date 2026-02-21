<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { func } from '../store';
    import { deployment } from './store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle
            href={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}`}>
            {$func.name}'s deployment
        </CoverTitle>
        <Id value={$deployment.$id}>{$deployment.$id}</Id>
    </svelte:fragment>
</Cover>
