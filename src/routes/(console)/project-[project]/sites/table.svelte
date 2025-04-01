<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { Avatar, Icon, Layout, Popover, Table, Typography } from '@appwrite.io/pink-svelte';
    import { columns } from './store';
    import type { Models } from '@appwrite.io/console';
    import SitesActionMenu from './sitesActionMenu.svelte';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import { SvgIcon } from '$lib/components';
    import { capitalize } from '$lib/helpers/string';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { timer } from '$lib/helpers/timeConversion';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { getFrameworkIcon } from '$lib/stores/sites';

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
            href={`${base}/project-${page.params.project}/sites/site-${site.$id}`}>
            {#each $columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === 'name'}
                        <Layout.Stack direction="row" alignItems="center" gap="s" inline>
                            <Avatar size="xs" alt={site.name}>
                                <SvgIcon iconSize="small" name={getFrameworkIcon(site.framework)} />
                            </Avatar>
                            {site.name}
                        </Layout.Stack>
                    {:else if column.id === 'domains'}
                        {site[column.id]}
                    {:else if column.id === 'deployed'}
                        {#if site.latestDeploymentStatus === 'building'}
                            Building {timer(site.latestDeploymentCreatedAt)}
                        {:else if site.latestDeploymentStatus === 'failed'}
                            <Popover let:toggle portal>
                                <button on:mouseenter={(e) => toggle(e)}>
                                    <Layout.Stack
                                        direction="row"
                                        alignItems="center"
                                        gap="xxs"
                                        inline>
                                        {capitalize(timeFromNow(site.deploymentCreatedAt))}

                                        <Icon
                                            icon={IconExclamation}
                                            size="s"
                                            color="--bgcolor-warning" />
                                    </Layout.Stack>
                                </button>
                                <svelte:fragment slot="tooltip">
                                    <Typography.Text variant="m-400">
                                        Last deployment failed {timeFromNow(
                                            site.latestDeploymentCreatedAt
                                        )}. <Link
                                            href={`${base}/project-${page.params.project}/sites/site-${site.$id}/deployments/deployment-${site.latestDeploymentId}`}>
                                            View logs
                                        </Link>
                                    </Typography.Text>
                                </svelte:fragment>
                            </Popover>
                        {:else}
                            <DualTimeView time={site.latestDeploymentCreatedAt} />
                        {/if}
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
