<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { showUsageRatesModal } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    let capActive = false;
    let budget: number;

    onMount(() => {
        budget = $organization?.billingBudget;
        capActive = !!$organization?.billingBudget;
    });

    async function updateBudget() {
        try {
            await sdk.forConsole.billing.updateBudget(
                $organization.$id,
                budget,
                $organization.budgetAlerts
            );
            invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                isHtml: true,
                message: `<span>Budget cap enabled for <b>${$organization.name}</b></span>`
            });
            trackEvent(Submit.BudgetCapUpdate, {
                budget: capActive ? budget : undefined
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: `There was an error enabling your budget cap`
            });
            trackError(error, Submit.BudgetCapUpdate);
        }
    }

    $: if (!capActive) {
        budget = 0;
    }
</script>

<Form onSubmit={updateBudget}>
    <CardGrid>
        <Heading tag="h2" size="6">Budget cap</Heading>

        <p class="text">
            Restrict your resource usage by setting a budget cap. <button
                on:click={() => ($showUsageRatesModal = true)}
                type="button"
                class="link">Learn more about usage rates.</button>
        </p>
        <svelte:fragment slot="aside">
            {#if $organization?.billingPlan === BillingPlan.STARTER}
                <Alert type="info">
                    <svelte:fragment slot="title">
                        Budget caps are a Pro plan feature
                    </svelte:fragment>
                    Upgrade to a Pro plan to set a budget cap for your organization. For more information
                    on what you can do with a Pro plan,
                    <a
                        class="link"
                        href="https://appwrite.io/pricing"
                        target="_blank"
                        rel="noopener noreferrer">view our pricing guide.</a>
                </Alert>
            {:else}
                <FormList>
                    <InputSwitch id="cap-active" label="Enable budget cap" bind:value={capActive}>
                        <svelte:fragment slot="description">
                            Budget cap limits do not include the base amount of your plan. Cap usage
                            is reset at the beginning of each billing cycle.
                        </svelte:fragment>
                    </InputSwitch>
                    {#if capActive}
                        <InputNumber
                            placeholder="Add budget cap"
                            id="cap"
                            label="Budget cap (USD)"
                            bind:value={budget} />
                    {/if}
                </FormList>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$organization?.billingBudget === budget} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
