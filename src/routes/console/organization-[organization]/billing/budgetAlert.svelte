<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
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
    import UsageRates from '$routes/console/wizard/cloudOrganization/usageRates.svelte';
    import { onMount } from 'svelte';

    let showRates = false;
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
                message: `Budget cap enabled for ${$organization.name}`
            });
            trackEvent(Submit.BudgetCapUpdate, {
                alerts
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: `There was an error enabling your budget cap`
            });
            trackError(error, Submit.BudgetCapUpdate);
        }
    }

    $: isButtonDisabled = symmetricDifference(alerts, $organization.budgetAlerts).length === 0;
</script>

<Form onSubmit={updateBudget}>
    <CardGrid>
        <Heading tag="h2" size="6">Budget alert condition</Heading>

        <p class="text">
            Get notified by email when your organization meets or exceeds a percent of your
            specified budget cap. You can set a maximum of 3 alerts.
        </p>
        <svelte:fragment slot="aside">
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
                        <Button secondary disabled={alerts.length > 2} on:click={addAlert}>
                            Add alert
                        </Button>
                    </div>
                </div>
            </FormList>

            {#if alerts.length}
                <Table noMargin noStyles>
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
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isButtonDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<UsageRates bind:show={showRates} tier={$organization?.billingPlan} />
