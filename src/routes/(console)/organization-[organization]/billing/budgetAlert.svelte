<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { Button, Form } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { Alert, Icon, Table } from '@appwrite.io/pink-svelte';
    import { IconTrash } from '@appwrite.io/pink-icons-svelte';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';

    export let alertsEnabled = false;

    let search: string;
    let selectedAlert: number;
    let alerts: number[] = [];

    $: options = [
        { value: 25, label: '25%', disabled: false },
        { value: 50, label: '50%', disabled: false },
        { value: 75, label: '75%', disabled: false },
        { value: 100, label: '100%', disabled: false }
    ].map((option) => {
        return {
            value: option.value,
            label: option.label,
            disabled: alerts.includes(option.value)
        };
    });

    onMount(() => {
        alerts = $organization?.budgetAlerts ?? [];
    });

    function addAlert() {
        if (alerts.some((alert) => alert === selectedAlert)) {
            return;
        }
        if (alerts.length <= 3) {
            alerts = [...alerts, selectedAlert ? selectedAlert : parseInt(search)];
            selectedAlert = null;
        }
    }

    async function updateBudget() {
        try {
            await sdk.forConsole.billing.updateBudget(
                $organization.$id,
                $organization.billingBudget,
                alerts
            );

            invalidate(Dependencies.ORGANIZATION);

            addNotification({
                type: 'success',
                isHtml: true,
                message: `<span> ${alerts.length === 0 ? 'Budget alerts removed from' : alerts.length > 1 ? `Budget alerts added to` : 'A budget alert has been added to'} <b>${$organization.name}</b> </span>`
            });
            trackEvent(Submit.BudgetAlertsUpdate, {
                alerts
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: 'The budget limit cannot be less than current billing cycle addon usage.'
            });
            trackError(error, Submit.BudgetAlertsUpdate);
        }
    }

    $: isButtonDisabled =
        symmetricDifference(alerts, $organization.budgetAlerts).length === 0 || !alertsEnabled;
</script>

<CardGrid>
    <svelte:fragment slot="title">Billing alerts</svelte:fragment>
    {#if !$currentPlan.budgeting}
        Get notified by email when your organization meets a percentage of your budget cap. <b
            >{tierToPlan($organization.billingPlan).name} organizations will receive one notification
            at 75% resource usage.</b>
    {:else}
        Get notified by email when your organization meets or exceeds a percentage of your specified
        billing alert(s).
    {/if}
    <svelte:fragment slot="aside">
        {#if !$currentPlan.budgeting}
            <Alert.Inline status="info" title="Billing alerts are a Pro plan feature">
                Upgrade to a Pro plan to manage when you receive billing alerts for your
                organization.
            </Alert.Inline>
        {:else if !$currentPlan.budgetCapEnabled}
            <Alert.Inline status="info" title="Budget cap disabled">
                Budget caps are not supported on your current plan. For more information, please
                reach out to your customer success manager.
            </Alert.Inline>
        {:else}
            {#if alerts.length >= 4}
                <Alert.Inline status="info">
                    You can set a maximum of 4 billing alerts per organization.
                </Alert.Inline>
            {:else}
                <div class="u-flex u-gap-16">
                    <InputSelect
                        required
                        label="Percentage (%) of budget cap"
                        placeholder="Select a percentage"
                        id="alerts"
                        {options}
                        bind:value={selectedAlert}
                        on:select={() => (search = selectedAlert.toString())} />
                    <div style="align-self: flex-end">
                        <Button
                            secondary
                            disabled={alerts.length > 3 || (!search && !selectedAlert)}
                            on:click={addAlert}>
                            Add alert
                        </Button>
                    </div>
                </div>
            {/if}

            {#if alerts.length}
                <Table.Root columns={[{ id: 'percentage' }, { id: 'action', width: 40 }]} let:root>
                    {#each alerts.sort() as alert}
                        <Table.Row.Base {root}>
                            <Table.Cell column="percentage" {root}>
                                {alert}%
                            </Table.Cell>
                            <Table.Cell column="action" {root}>
                                <Button
                                    text
                                    icon
                                    ariaLabel="remove alert"
                                    on:click={() => (alerts = alerts.filter((a) => a !== alert))}>
                                    <Icon icon={IconTrash} size="s" />
                                </Button>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {/if}
        {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Form onSubmit={updateBudget}>
            {#if $organization?.billingPlan === BillingPlan.FREE || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                <Button
                    secondary
                    href={$upgradeURL}
                    on:click={() => {
                        trackEvent(Click.OrganizationClickUpgrade, {
                            from: 'button',
                            source: 'billing_alerts_card'
                        });
                    }}
                    >Upgrade to Pro
                </Button>
            {:else}
                <Button disabled={isButtonDisabled} submit>Update</Button>
            {/if}
        </Form>
    </svelte:fragment>
</CardGrid>
