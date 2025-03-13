<script lang="ts">
    import { Modal, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { members, organization, organizationList } from '$lib/stores/organization';
    import { goto, invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { projects } from '../store';
    import { toLocaleDate } from '$lib/helpers/date';
    import { isCloud } from '$lib/system';
    import type { InvoiceList } from '$lib/sdk/billing';
    import { formatCurrency } from '$lib/helpers/numbers';
    import { tierToPlan } from '$lib/stores/billing';
    import { Table, Tabs, Alert } from '@appwrite.io/pink-svelte';

    export let showDelete = false;
    export let invoices: InvoiceList;
    let error: string = null;

    let selectedTab = 'projects';
    let organizationName: string = null;

    /* enable overflow-x */
    const columnWidth = 120;
    const columnWidthSmall = columnWidth / 4;

    async function deleteOrg() {
        try {
            if (isCloud) {
                await sdk.forConsole.billing.deleteOrganization($organization.$id);
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
                message:
                    $organization.billingPlan === BillingPlan.FREE
                        ? `${$organization.name} has been deleted`
                        : `${$organization.name} has been flagged for deletion`
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.OrganizationDelete);
        }
    }

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

    $: tabData =
        selectedTab === 'projects'
            ? {
                  headers: ['Project', '', 'Last Updated'],
                  rows: $projects.projects.map((project) => ({
                      cells: [project.name, '', toLocaleDate(project.$updatedAt)]
                  }))
              }
            : {
                  headers: ['Member', '', 'Last Activity'],
                  rows: $members.memberships.map((member) => ({
                      cells: [member.userName, '', toLocaleDate(member.$updatedAt)]
                  }))
              };

    $: upcomingInvoice = invoices?.invoices.find((i) => i.status === 'upcoming' && i.amount > 0);

    $: if (!showDelete) {
        // reset on close.
        organizationName = '';
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

        <Table.Root>
            <svelte:fragment slot="header">
                {#each tabData.headers as header}
                    <Table.Header.Cell width={columnWidth + 'px'}>{header}</Table.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each tabData.rows as row}
                <Table.Row>
                    {#each row.cells as cell}
                        <Table.Cell>{cell}</Table.Cell>
                    {/each}
                </Table.Row>
            {/each}
        </Table.Root>
        <div class="box is-not-desktop">
            <SecondaryTabs large stretch class="u-sep-block-end u-padding-8">
                {#each tabs as { name, label, total }}
                    <SecondaryTabsItem
                        center
                        fullWidth
                        disabled={selectedTab === name}
                        on:click={() => (selectedTab = name)}>
                        {label.mobile} ({total})
                    </SecondaryTabsItem>
                {/each}
            </SecondaryTabs>

            <Table.Root>
                <svelte:fragment slot="header">
                    {#each tabData.headers as header, index}
                        <Table.Header.Cell
                            width={(index === 1 ? columnWidthSmall : columnWidth) + 'px'}
                            >{header}</Table.Header.Cell>
                    {/each}
                </svelte:fragment>
                {#each tabData.rows as row}
                    <Table.Row>
                        {#each row.cells as cell}
                            <Table.Cell>{cell}</Table.Cell>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Root>
        </div>
    {/if}
    <InputText
        label={`Confirm the organization name to continue`}
        placeholder="Enter {$organization.name} to continue"
        id="organization-name"
        required
        bind:value={organizationName} />
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
    .box {
        padding: unset;
        border-radius: var(--border-radius-medium, 8px);
    }

    :global(.max-height-dialog dialog) {
        max-height: 650px;
    }
</style>
