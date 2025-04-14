<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { tierToPlan, upgradeURL } from '$lib/stores/billing';
    import { Button, Form, FormList, InputSelectSearch } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { currentPlan, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

    export let alertsEnabled = false;

    let search: string;
    let selectedAlert: number;
    let alerts: number[] = [];

    const options = [
        { value: 25, label: '25%' },
        { value: 50, label: '50%' },
        { value: 75, label: '75%' },
        { value: 100, label: '100%' }
    ];

    onMount(() => {
        alerts = $organization?.budgetAlerts ?? [];
    });

    function addAlert() {
        if (isNaN(parseInt(search))) return;
        if (alerts.some((alert) => alert === selectedAlert)) {
            return;
        }
        if (alerts.length <= 3) {
            alerts = [...alerts, selectedAlert ? selectedAlert : parseInt(search)];
            search = '';
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
                message: `There was an error enabling your budget cap`
            });
            trackError(error, Submit.BudgetAlertsUpdate);
        }
    }

    $: isButtonDisabled =
        symmetricDifference(alerts, $organization.budgetAlerts).length === 0 || !alertsEnabled;
</script>

<Form onSubmit={updateBudget}>
    <CardGrid>
        <Heading tag="h2" size="6">Billing alerts</Heading>

        <p class="text">
            {#if !$currentPlan.budgeting}
                Get notified by email when your organization meets a percentage of your budget cap. <b
                    >{tierToPlan($organization.billingPlan).name} organizations will receive one notification
                    at 75% resource usage.</b>
            {:else}
                Get notified by email when your organization meets or exceeds a percentage of your
                specified billing alert(s).
            {/if}
        </p>
        <svelte:fragment slot="aside">
            {#if !$currentPlan.budgeting}
                <Alert type="info">
                    <svelte:fragment slot="title"
                        >Billing alerts are a Pro plan feature
                    </svelte:fragment>
                    Upgrade to a Pro plan to manage when you receive billing alerts for your organization.
                </Alert>
            {:else if !$currentPlan.budgetCapEnabled}
                <Alert type="info">
                    <svelte:fragment slot="title">Budget cap disabled</svelte:fragment>
                    Budget caps are not supported on your current plan. For more information, please
                    reach out to your customer success manager.
                </Alert>
            {:else}
                <FormList>
                    <Alert type="info">
                        You can set a maximum of 4 billing alerts per organization.
                    </Alert>

                    <div class="u-flex u-gap-16">
                        <InputSelectSearch
                            disabled={!alertsEnabled}
                            label="Percentage (%) of budget cap"
                            placeholder="Select a percentage"
                            id="alerts"
                            {options}
                            bind:search
                            interactiveOutput
                            bind:value={selectedAlert}
                            on:select={() => (search = selectedAlert.toString())} />
                        <div style="align-self: flex-end">
                            <Button
                                secondary
                                disabled={alerts.length > 3 ||
                                    (!search && !selectedAlert) ||
                                    !alertsEnabled}
                                on:click={addAlert}>
                                Add alert
                            </Button>
                        </div>
                    </div>
                </FormList>

                {#if alerts.length}
                    <Table noMargin noStyles transparent>
                        <TableHeader>
                            <TableCellHead>Alert at budget cap %</TableCellHead>
                            <TableCellHead width={30} />
                        </TableHeader>
                        <TableBody>
                            {#each alerts.sort() as alert}
                                <TableRow>
                                    <TableCellText title="Percentage">
                                        {alert}%
                                    </TableCellText>
                                    <TableCell>
                                        <Button
                                            text
                                            round
                                            ariaLabel="remove alert"
                                            on:click={() =>
                                                (alerts = alerts.filter((a) => a !== alert))}>
                                            <span class="icon-x" aria-hidden="true" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                {/if}
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            {#if $organization?.billingPlan === BillingPlan.FREE || $organization?.billingPlan === BillingPlan.GITHUB_EDUCATION}
                <Button
                    secondary
                    href={$upgradeURL}
                    on:click={() => {
                        trackEvent('click_organization_upgrade', {
                            from: 'button',
                            source: 'billing_alerts_card'
                        });
                    }}
                    >Upgrade to Pro
                </Button>
            {:else}
                <Button disabled={isButtonDisabled} submit>Update</Button>
            {/if}
        </svelte:fragment>
    </CardGrid>
</Form>
