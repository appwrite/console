<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { showUsageRatesModal, getChangePlanUrl } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { Alert, Link } from '@appwrite.io/pink-svelte';
    import BudgetAlert from './budgetAlert.svelte';
    import type { Models } from '@appwrite.io/console';

    export let currentPlan: Models.BillingPlan;
    export let organization: Models.Organization;

    let budget = organization.billingBudget;
    let capActive = organization?.billingBudget !== null;

    async function updateBudget() {
        try {
            await sdk.forConsole.organizations.updateBudget({
                organizationId: organization.$id,
                budget,
                alerts: organization.budgetAlerts
            });
            await invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: `Budget cap enabled for ${organization.name}`
            });
            trackEvent(Submit.BudgetCapUpdate, {
                budget: capActive ? budget : undefined
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.BudgetCapUpdate);
        }
    }

    $: if (!capActive) {
        budget = null;
    }
</script>

<Form onSubmit={updateBudget}>
    <CardGrid>
        <svelte:fragment slot="title">Budget cap</svelte:fragment>
        Restrict your resource usage by setting a budget cap. Cap usage is reset at the beginning of each
        billing cycle.
        <svelte:fragment slot="aside">
            {#if !currentPlan.budgeting}
                <Alert.Inline status="info" title="Budget caps are a Pro plan feature">
                    Upgrade to a Pro plan to set a budget cap for your organization. For more
                    information on what you can do with a Pro plan,
                    <Link.Anchor
                        href="https://appwrite.io/pricing"
                        target="_blank"
                        rel="noopener noreferrer">view our pricing guide.</Link.Anchor>
                </Alert.Inline>
            {:else if !currentPlan.budgetCapEnabled}
                <Alert.Inline status="info" title="Budget cap disabled">
                    Budget caps are not supported on your current plan. For more information, please
                    reach out to your customer success manager.
                </Alert.Inline>
            {:else}
                <InputSwitch id="cap-active" label="Enable budget cap" bind:value={capActive}>
                    <svelte:fragment slot="description">
                        Budget cap limits do not include the base amount of your plan. <button
                            class="link"
                            type="button"
                            on:click={() => ($showUsageRatesModal = true)}
                            >Learn more about usage rates.
                        </button>
                    </svelte:fragment>
                </InputSwitch>
                {#if capActive}
                    <InputNumber
                        required
                        placeholder="Add budget cap"
                        id="cap"
                        label="Budget cap (USD)"
                        bind:value={budget} />
                {/if}
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            {#if !currentPlan.budgetCapEnabled}
                <Button
                    secondary
                    href={getChangePlanUrl(organization.$id)}
                    on:click={() => {
                        trackEvent(Click.OrganizationClickUpgrade, {
                            from: 'button',
                            source: 'billing_budget_cap'
                        });
                    }}
                    >Upgrade to Pro
                </Button>
            {:else}
                <Button disabled={organization?.billingBudget === budget} submit>Update</Button>
            {/if}
        </svelte:fragment>
    </CardGrid>
</Form>

<BudgetAlert {organization} {currentPlan} alertsEnabled={capActive && budget > 0} />
