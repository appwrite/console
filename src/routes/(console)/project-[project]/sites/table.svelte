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

<Table.Root columns={[...$columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each siteList.sites as site}
        <Table.Row.Link
            {root}
            href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'name'}
                        <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                            <Avatar size="xs" alt={site.name}>
                                <SvgIcon iconSize="small" name={getFrameworkIcon(site.framework)} />
                            </Avatar>
                            {site.name}
                        </Layout.Stack>
                    {:else if column.id === '$updatedAt'}
                        {toLocaleDateTime(site[column.id])}
                    {:else if column.id === '$createdAt'}
                        {toLocaleDateTime(site[column.id])}
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
                <Layout.Stack alignItems="flex-end">
                    <SitesActionMenu {site} bind:showAddCollaborator bind:selectedSite />
                </Layout.Stack>
            </Table.Cell>
        </Table.Row.Link>
    {/each}
</Table.Root>
{#if selectedSite?.$id && showAddCollaborator}
    <AddCollaboratorModal bind:show={showAddCollaborator} />
{/if}
