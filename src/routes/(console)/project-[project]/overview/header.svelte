<script lang="ts">
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { onboarding, project } from '../store';
</script>

{#if !$onboarding}
    <Cover>
        <svelte:fragment slot="header">
            <CoverTitle>
                {$project?.name}
            </CoverTitle>
            <Id value={$project.$id}>{$project.$id}</Id>
        </svelte:fragment>
    </Cover>
{/if}
