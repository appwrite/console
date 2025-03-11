<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import { Card, Layout } from '@appwrite.io/pink-svelte';
    import { getFrameworkIcon } from './store';
    import { SvgIcon } from '$lib/components';
    import { app } from '$lib/stores/app';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import AddCollaboratorModal from './(components)/addCollaboratorModal.svelte';
    import SitesActionMenu from './sitesActionMenu.svelte';

    export let siteList: Models.SiteList;
    export let deployments: Models.Deployment[];

    let showAddCollaborator = false;
    let selectedSite: Models.Site = null;

    function getScreenshot(theme: string, site: Models.Site) {
        const deployment =
            deployments.find((d) => site.deploymentId && d.$id === site.deploymentId) ?? null;

        if (theme === 'dark') {
            return deployment?.screenshotDark
                ? getFilePreview(deployment.screenshotDark)
                : `${base}/images/sites/screenshot-placeholder-dark.svg`;
        }

        return deployment?.screenshotLight
            ? getFilePreview(deployment.screenshotLight)
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
            href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}
            padding="xxs">
            <Card.Media
                title={site.name}
                description={`Updated ${timeFromNow(site.$updatedAt)}`}
                src={getScreenshot($app.themeInUse, site)}
                alt={site.name}
                avatar>
                <svelte:fragment slot="avatar">
                    <SvgIcon name={getFrameworkIcon(site.framework)} iconSize="small" />
                </svelte:fragment>
                <SitesActionMenu {site} bind:showAddCollaborator bind:selectedSite />
            </Card.Media>
        </Card.Link>
    {/each}
</Layout.Grid>

{#if selectedSite?.$id && showAddCollaborator}
    <AddCollaboratorModal bind:show={showAddCollaborator} />
{/if}
