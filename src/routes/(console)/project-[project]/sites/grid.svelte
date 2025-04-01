<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Card, Icon, Layout, Popover, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { generateSiteDeploymentDesc } from './store';
    import { SvgIcon } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import SitesActionMenu from './sitesActionMenu.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { IconExclamation } from '@appwrite.io/pink-icons-svelte';
    import { Link } from '$lib/elements';
    import { getFrameworkIcon } from '$lib/stores/sites';

    export let siteList: Models.SiteList;

    let showAddCollaborator = false;
    let selectedSite: Models.Site = null;

    function getScreenshot(theme: string, site: Models.Site) {
        if (theme === 'dark') {
            return site?.deploymentScreenshotDark
                ? getFilePreview(site?.deploymentScreenshotDark)
                : `${base}/images/sites/screenshot-placeholder-dark.svg`;
        }

        return site?.deploymentScreenshotLight
            ? getFilePreview(site?.deploymentScreenshotLight)
            : `${base}/images/sites/screenshot-placeholder-light.svg`;
    }

    function getFilePreview(fileId: string) {
        // TODO: @Meldiron use sdk.forConsole.storage.getFilePreview
        const endpoint = getApiEndpoint();
        return endpoint + `/storage/buckets/screenshots/files/${fileId}/view?project=console`;
    }
</script>

<Layout.Grid columns={3} columnsXS={1} columnsXXS={1}>
    {#each siteList.sites as site}
        <Card.Link
            href={`${base}/project-${page.params.project}/sites/site-${site.$id}`}
            padding="xxs">
            <Card.Media
                title={site.name}
                description={generateSiteDeploymentDesc(site)}
                src={getScreenshot($app.themeInUse, site)}
                alt={site.name}
                avatar>
                <svelte:fragment slot="avatar">
                    <Tooltip>
                        <SvgIcon name={getFrameworkIcon(site.framework)} iconSize="small" />
                        <svelte:fragment slot="tooltip">
                            {capitalize(site.framework)}
                        </svelte:fragment>
                    </Tooltip>
                </svelte:fragment>
                <SitesActionMenu {site} bind:showAddCollaborator bind:selectedSite />

                <svelte:fragment slot="description-end">
                    {#if site.latestDeploymentStatus === 'failed'}
                        <Popover let:toggle portal>
                            <button on:mouseenter={(e) => toggle(e)}>
                                <Layout.Stack alignItems="center">
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
                    {/if}
                </svelte:fragment>
            </Card.Media>
        </Card.Link>
    {/each}
</Layout.Grid>

{#if selectedSite?.$id && showAddCollaborator}
    <AddCollaboratorModal bind:show={showAddCollaborator} />
{/if}
