<script lang="ts">
    import { Modal, SecondaryTabs, SecondaryTabsItem } from '$lib/components';
    import { Button, FormList, InputText } from '$lib/elements/forms';
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
    import type { EstimationDeleteOrganization } from '$lib/sdk/billing';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { onMount } from 'svelte';
    import DeleteOrganizationEstimation from './deleteOrganizationEstimation.svelte';
    import { billingURL } from '$lib/stores/billing';

    export let showDelete = false;
    let error: string = null;

    let selectedTab = 'projects';
    let organizationName: string = null;

    let estimation: EstimationDeleteOrganization;

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
                await goto(`${base}/onboarding`);
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

<div class="max-height-dialog">
    <Modal
        title="Delete organization"
        onSubmit={deleteOrg}
        bind:show={showDelete}
        bind:error
        icon="exclamation"
        state="warning"
        headerDivider={false}>
        {#if estimation && (estimation.unpaidInvoices.length > 0 || estimation.grossAmount > 0)}
            <DeleteOrganizationEstimation {estimation} />
        {:else}
            <p data-private>
                {#if $projects.total > 0}
                    The following projects and all data associated with <b>{$organization.name}</b>
                    will be permanently deleted. <b>This action is irreversible</b>.
                {:else}
                    All data associated with <b>{$organization.name}</b> will be permanently
                    deleted.
                    <b>This action is irreversible</b>.
                {/if}
            </p>

            {#if $projects.total > 0}
                <div class="box is-only-desktop">
                    <SecondaryTabs large stretch class="u-sep-block-end u-padding-8">
                        {#each tabs as { name, label, total }}
                            <SecondaryTabsItem
                                center
                                fullWidth
                                disabled={selectedTab === name}
                                on:click={() => (selectedTab = name)}>
                                {label.desktop} ({total})
                            </SecondaryTabsItem>
                        {/each}
                    </SecondaryTabs>

                    <TableScroll dense noMargin>
                        <TableHeader>
                            {#each tabData.headers as header}
                                <TableCellHead width={columnWidth}>{header}</TableCellHead>
                            {/each}
                        </TableHeader>
                        <TableBody>
                            {#each tabData.rows as row}
                                <TableRow>
                                    {#each row.cells as cell}
                                        <TableCell width={columnWidth}>{cell}</TableCell>
                                    {/each}
                                </TableRow>
                            {/each}
                        </TableBody>
                    </TableScroll>
                </div>
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

                    <TableScroll dense noMargin>
                        <TableHeader>
                            {#each tabData.headers as header, index}
                                <TableCellHead width={index === 1 ? columnWidthSmall : columnWidth}
                                    >{header}</TableCellHead>
                            {/each}
                        </TableHeader>
                        <TableBody>
                            {#each tabData.rows as row}
                                <TableRow>
                                    {#each row.cells as cell, index}
                                        <TableCell
                                            width={index === 1 ? columnWidthSmall : columnWidth}
                                            >{cell}</TableCell>
                                    {/each}
                                </TableRow>
                            {/each}
                        </TableBody>
                    </TableScroll>
                </div>
            {/if}

            <FormList>
                <InputText
                    label={`Confirm the organization name to continue`}
                    placeholder="Enter {$organization.name} to continue"
                    id="organization-name"
                    required
                    bind:value={organizationName} />
            </FormList>
        {/if}

        <svelte:fragment slot="footer">
            <Button text on:click={() => (showDelete = false)}>Cancel</Button>
            {#if estimation && estimation.unpaidInvoices.length > 0}
                <Button href={$billingURL} secondary>View invoices</Button>
            {:else}
                <Button
                    secondary
                    submit
                    disabled={!error &&
                        (!organizationName || organizationName !== $organization.name)}>
                    Delete
                </Button>
            {/if}
        </svelte:fragment>
    </Modal>
</div>

<style>
    .box {
        padding: unset;
        border-radius: var(--border-radius-medium, 8px);
    }

    :global(.max-height-dialog dialog) {
        max-height: 650px;
    }
</style>
