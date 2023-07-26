<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputNumber, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import UsageRates from '$routes/console/wizard/cloudOrganization/usageRates.svelte';
    import { onMount } from 'svelte';

    let capActive = false;
    let budget: number;
    let showRates = false;

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
                message: `Budget cap enabled for ${$organization.name}`
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
            Restrict your resource usage by setting a budget cap. <a
                href="#/"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more about usage rates.</a>
        </p>
        <svelte:fragment slot="aside">
            {#if $organization?.billingPlan === 'tier-0'}
                <Alert type="info">
                    <svelte:fragment slot="title">
                        Budget caps are a Pro plan feature
                    </svelte:fragment>
                    Upgrade to a Pro plan to set a budget cap for your organization. For more information
                    on what you can do with a Pro plan,
                    <button type="button" class="link" on:click={() => (showRates = true)}
                        >view our pricing guide.</button>
                </Alert>
            {:else}
                <FormList>
                    <InputSwitch id="capActive" label="Enable budget cap" bind:value={capActive} />
                    {#if capActive}
                        <InputNumber
                            placeholder="Add budget cap"
                            id="cap"
                            label="Budget cap ($USD)"
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

<UsageRates bind:show={showRates} tier={$organization?.billingPlan} />
