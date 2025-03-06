<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Avatar, Layout, Table } from '@appwrite.io/pink-svelte';
    import { columns, getFrameworkIcon } from './store';
    import type { Models } from '@appwrite.io/console';
    import SitesActionMenu from './sitesActionMenu.svelte';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import { SvgIcon } from '$lib/components';

    export let siteList: Models.SiteList;

    let showAddCollaborator = false;
    let selectedSite: Models.Site = null;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column?.width?.toString() ?? ''}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each siteList.sites as site}
        <Table.Link href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}>
            {#each $columns as column}
                {#if column.show}
                    {#if column.id === 'name'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                                <Avatar size="xs" alt={site.name}>
                                    <SvgIcon
                                        iconSize="small"
                                        name={getFrameworkIcon(site.framework)} />
                                </Avatar>
                                {site.name}
                            </Layout.Stack>
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {toLocaleDateTime(site[column.id])}
                        </Table.Cell>
                    {:else if column.id === '$createdAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {toLocaleDateTime(site[column.id])}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <Layout.Stack alignItems="flex-end">
                    <SitesActionMenu {site} bind:showAddCollaborator bind:selectedSite />
                </Layout.Stack>
            </Table.Cell>
        </Table.Link>
    {/each}
</Table.Root>
{#if selectedSite?.$id && showAddCollaborator}
    <AddCollaboratorModal bind:show={showAddCollaborator} />
{/if}
