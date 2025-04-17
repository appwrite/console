<script lang="ts">
    import { page } from '$app/state';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
</script>

{#if $organization?.markedForDeletion && !hideBillingHeaderRoutes.includes(page.url.pathname)}
    <HeaderAlert title="Organization flagged for deletion">
        <svelte:fragment>
            All existing projects in the {$organization.name} organization have been paused. This organization
            will be deleted once your upcoming invoice is processed successfully.
        </svelte:fragment>
    </HeaderAlert>
{/if}
