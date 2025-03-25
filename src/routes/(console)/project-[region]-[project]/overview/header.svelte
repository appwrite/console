<script lang="ts">
    import { Id, RegionEndpoint } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { project } from '../store';
</script>

<Cover>
    <svelte:fragment slot="header">
        <CoverTitle>
            {$project?.name}
        </CoverTitle>

        <div class="u-flex u-gap-8 u-cross-center">
            <Id value={$project.$id}>{$project.$id}</Id>

            <RegionEndpoint />
        </div>
    </svelte:fragment>
</Cover>
