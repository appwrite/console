<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Card, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import { getFrameworkIcon } from './store';
    import { SvgIcon } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import SitesActionMenu from './sitesActionMenu.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { timer } from '$lib/helpers/timeConversion';

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

    function generateDesc(site: Models.Site) {
        if (site.latestDeploymentStatus === 'building') {
            return `Deployment building ${timer(site.latestDeploymentCreatedAt)}`;
        } else {
            return `Deployed ${timeFromNow(site.deploymentCreatedAt)}`;
        }
    }
</script>

<Layout.Grid columns={3} columnsXS={1} columnsXXS={1}>
    {#each siteList.sites as site}
        <Card.Link
            href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}
            padding="xxs">
            <Card.Media
                title={site.name}
                description={generateDesc(site)}
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
            </Card.Media>
        </Card.Link>
    {/each}
</Layout.Grid>

{#if selectedSite?.$id && showAddCollaborator}
    <AddCollaboratorModal bind:show={showAddCollaborator} />
{/if}
