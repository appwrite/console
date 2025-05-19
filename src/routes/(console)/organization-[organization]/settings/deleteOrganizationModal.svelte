<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { members, organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { projects } from '../store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { isCloud } from '$lib/system';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { tierToPlan } from '$lib/stores/billing';
    import { Table, Tabs, Alert } from '@appwrite.io/pink-svelte';
    import DeleteOrganizationEstimation from './deleteOrganizationEstimation.svelte';
    import { onMount } from 'svelte';
    import type { EstimationDeleteOrganization } from '$lib/sdk/billing';
    import type { Models } from '@appwrite.io/console';

    export let showDelete = false;
    export let invoices: Models.InvoiceList;
    let error: string = null;

    let selectedTab = 'projects';
    let organizationName: string = null;
    let estimation: EstimationDeleteOrganization;

    async function deleteOrg() {
        try {
            if (isCloud) {
                await sdk.forConsole.organizations.delete($organization.$id);
            } else {
                await sdk.forConsole.teams.delete($organization.$id);
            }
            const prefs = await sdk.forConsole.account.getPrefs();
            const newPrefs = { ...prefs, organization: null };
            await sdk.forConsole.account.updatePrefs(newPrefs);
            if ($organizationList?.total > 1) {
                await goto(`${base}/account/organizations`);
            } else {
                await goto(`${base}/onboarding/create-project`);
            }
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            trackEvent(Submit.OrganizationDelete);
            showDelete = false;
            addNotification({
                type: 'success',
                message: `${$organization.name} has been deleted`
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationDelete);
        }
    }

    onMount(() => getEstimate());

    const tabs = [
        {
            name: 'projects',
            label: { desktop: 'Projects', mobile: 'Projects' },
            total: $projects.total
        },
        {
            name: 'members',
            label: { desktop: 'Total Members', mobile: 'Members' },
            total: $members.total
        }
    ];

    $: upcomingInvoice = invoices?.invoices.find((i) => i.status === 'upcoming' && i.amount > 0);

    $: if (!showDelete) {
        // reset on close.
        organizationName = '';
    }

    async function getEstimate() {
        if (isCloud) {
            try {
                error = '';
                estimation = await sdk.forConsole.billing.estimationDeleteOrganization(
                    $organization.$id
                );
            } catch (e) {
                error = e.message;
            }
        }
    }
</script>

<Modal title="Delete organization" onSubmit={deleteOrg} bind:show={showDelete} bind:error>
    {#if upcomingInvoice}
        <Alert.Inline
            status="warning"
            title={`You have a pending ${formatCurrency(upcomingInvoice.grossAmount)} invoice for your
        ${tierToPlan(upcomingInvoice.plan).name} plan`}>
            By proceeding, your invoice will be processed within the hour. Upon successful payment,
            your organization will be deleted.
        </Alert.Inline>
    {/if}

    <p slot="description">
        {#if $projects.total > 0}
            The following projects and all data associated with <b>{$organization.name}</b> will be
            permanently deleted. <b>This action is irreversible</b>.
        {:else}
            All data associated with <b>{$organization.name}</b> will be permanently deleted.
            <b>This action is irreversible</b>.
        {/if}
    </p>
    {#if estimation && (estimation.unpaidInvoices.length > 0 || estimation.grossAmount > 0)}
        <DeleteOrganizationEstimation {estimation} />
    {:else}
        {#if $projects.total > 0}
            <Tabs.Root let:root stretch>
                {#each tabs as { name, label, total }}
                    <Tabs.Item.Button
                        {root}
                        on:click={() => (selectedTab = name)}
                        active={selectedTab === name}>
                        {label.desktop} ({total})
                    </Tabs.Item.Button>
                {/each}
            </Tabs.Root>
            {#if selectedTab === 'projects'}
                <Table.Root columns={[{ id: 'projects' }, { id: 'lastUpdated' }]} let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="projects" {root}>Projects</Table.Header.Cell>
                        <Table.Header.Cell column="lastUpdated" {root}
                            >Last updated</Table.Header.Cell>
                    </svelte:fragment>
                    {#each $projects.projects as project}
                        <Table.Row.Base {root}>
                            <Table.Cell column="projects" {root}>{project.name}</Table.Cell>
                            <Table.Cell column="lastUpdated" {root}
                                >{toLocaleDate(project.$updatedAt)}</Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {:else}
                <Table.Root columns={[{ id: 'member' }, { id: 'lastUpdated' }]} let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="member" {root}>Members</Table.Header.Cell>
                        <Table.Header.Cell column="lastUpdated" {root}
                            >Last updated</Table.Header.Cell>
                    </svelte:fragment>
                    {#each $members.memberships as membership}
                        <Table.Row.Base {root}>
                            <Table.Cell column="member" {root}>{membership.userName}</Table.Cell>
                            <Table.Cell column="lastUpdated" {root}
                                >{toLocaleDate(membership.$updatedAt)}</Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {/if}
        {/if}
        <InputText
            label={`Confirm the organization name to continue`}
            placeholder="Enter {$organization.name} to continue"
            id="organization-name"
            required
            bind:value={organizationName} />
    {/if}
    <svelte:fragment slot="footer">
        <Button text on:click={() => (showDelete = false)}>Cancel</Button>
        <Button
            secondary
            submit
            disabled={!error && (!organizationName || organizationName !== $organization.name)}>
            Delete
        </Button>
    </svelte:fragment>
</Modal>

<style>
    :global(.max-height-dialog dialog) {
        max-height: 650px;
    }
</style>
