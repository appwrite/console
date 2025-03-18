<script lang="ts">
    import { page } from '$app/stores';
    import { BillingPlan } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { organization } from '$lib/stores/organization';
    import { HeaderAlert } from '$lib/layout';
    import { hideBillingHeaderRoutes, readOnly, showBudgetAlert } from '$lib/stores/billing';
    import { base } from '$app/paths';

    $: redirectUrl = `${base}/organization-${$organization.$id}/billing#update-budget`;
    $: isSameUrl = $page.url.pathname === new URL(redirectUrl, window.location.origin).pathname;
</script>

{#if $showBudgetAlert && $organization?.$id && $organization?.billingPlan !== BillingPlan.FREE && $readOnly && !hideBillingHeaderRoutes.includes($page.url.pathname)}
    <HeaderAlert type="error" title="Budget limit reached">
        <svelte:fragment>
            This organization has reached its budget limit and is now blocked. To continue using
            Appwrite services, update the budget limit.
        </svelte:fragment>
        <svelte:fragment slot="buttons">
            <Button href={`${base}/organization-${$organization.$id}/usage`} text fullWidthMobile>
                <span class="text">View usage</span>
            </Button>

            <!-- target="_self" for same page navigation -->
            <Button secondary fullWidthMobile href={redirectUrl} target={isSameUrl ? '_self' : ''}>
                <span class="text">Update limit</span>
            </Button>
        </svelte:fragment>
    </HeaderAlert>
{/if}
