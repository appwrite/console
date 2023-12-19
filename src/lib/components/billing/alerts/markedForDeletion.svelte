<script lang="ts">
    import { page } from '$app/stores';
    import { HeaderAlert } from '$lib/layout';
    import { organization } from '$lib/stores/organization';
</script>

{#if $organization?.markedForDeletion && !$page.url.pathname.includes('/console/account')}
    <HeaderAlert title="Organization flagged for deletion">
        <svelte:fragment>
            All existing projects in the {$organization.name} organization have been paused. This organization
            will be deleted once your upcoming invoice is processed successfully.
        </svelte:fragment>
    </HeaderAlert>
{/if}
