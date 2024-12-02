<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { upgradeURL } from '$lib/stores/billing';
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
    import { organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';

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
        if (alerts.length <= 2) {
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
                message: `<span>A budget alert has been added to <b>${$organization.name}</b></span>`
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

    $: isButtonDisabled = symmetricDifference(alerts, $organization.budgetAlerts).length === 0;
</script>

<Form onSubmit={updateBudget}>
    <CardGrid>
        <Heading tag="h2" size="6">Budget alerts</Heading>

        <p class="text">
            Get notified by email when your organization reaches or exceeds a percent of your
            specified budget cap. You can set a maximum of 3 alerts.
        </p>
        <svelte:fragment slot="aside">
            {#if $organization?.billingPlan === BillingPlan.FREE}
                <Alert type="info">
                    <svelte:fragment slot="title"
                        >Budget alerts are a Pro plan feature
                    </svelte:fragment>
                    Upgrade to a Pro plan to set a budget alerts for your organization. For more information
                    on what you can do with a Pro plan,
                    <a
                        class="link"
                        href="https://appwrite.io/pricing"
                        target="_blank"
                        rel="noopener noreferrer">view our pricing guide.</a>
                </Alert>
            {:else}
                <FormList>
                    <div class="u-flex u-gap-16">
                        <InputSelectSearch
                            label="Percentage (%) of budget cap"
                            placeholder="Select a percentage"
                            id="alerts"
                            {options}
                            bind:search
                            bind:value={selectedAlert}
                            on:select={() => (search = selectedAlert.toString())} />
                        <div style="align-self: flex-end">
                            <Button
                                secondary
                                disabled={alerts.length > 2 || (!search && !selectedAlert)}
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
            {#if $organization?.billingPlan === BillingPlan.FREE}
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
