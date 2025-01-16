<script lang="ts">
    import { Id } from '$lib/components';
    import { Cover, CoverTitle } from '$lib/layout';
    import { onboarding, project } from '../store';
    import { hasOnboardingDismissed } from '$lib/helpers/onboarding';
</script>

{#if hasOnboardingDismissed($project.$id)}
    <Cover>
        <svelte:fragment slot="header">
            <CoverTitle>
                {$project?.name}
            </CoverTitle>
            <Id value={$project.$id}>{$project.$id}</Id>
        </svelte:fragment>
    </Cover>
{/if}
