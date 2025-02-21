<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { timeFromNow } from '$lib/helpers/date';
    import type { Models } from '@appwrite.io/console';
    import {
        IconCog,
        IconDotsHorizontal,
        IconGlobeAlt,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { ActionMenu, Card, Icon, Layout, Popover } from '@appwrite.io/pink-svelte';
    import RedeployModal from './redeployModal.svelte';
    import { getFrameworkIcon } from './store';
    import { SvgIcon } from '$lib/components';
    import { app } from '$lib/stores/app';

    export let siteList: Models.SiteList;
    export let deployments: Models.Deployment[];

    let showRedeploy = false;
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
        return `http://localhost/v1/storage/buckets/screenshots/files/${fileId}/view?project=console&mode=admin`;
    }
</script>

<Layout.GridBox itemSize="274px">
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
                <Popover placement="bottom-end" let:toggle>
                    <Button
                        text
                        icon
                        size="s"
                        on:click={(e) => {
                            e.preventDefault();
                            toggle(e);
                        }}>
                        <Icon size="s" icon={IconDotsHorizontal} /></Button>
                    <svelte:fragment slot="tooltip" let:toggle>
                        <ActionMenu.Root>
                            <ActionMenu.Item.Button
                                leadingIcon={IconRefresh}
                                on:click={(e) => {
                                    e.preventDefault();
                                    selectedSite = site;
                                    showRedeploy = true;
                                    toggle(e);
                                }}>
                                Redeploy
                            </ActionMenu.Item.Button>
                            <ActionMenu.Item.Anchor
                                href={`${base}/project-${$page.params.project}/sites/site-${site.$id}/domains`}
                                leadingIcon={IconGlobeAlt}>
                                Domains
                            </ActionMenu.Item.Anchor>
                            <ActionMenu.Item.Anchor
                                href={`${base}/project-${$page.params.project}/sites/site-${site.$id}/settings`}
                                leadingIcon={IconCog}>
                                Settings
                            </ActionMenu.Item.Anchor>
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Popover>
            </Card.Media>
        </Card.Link>
    {/each}
</Layout.GridBox>

{#if selectedSite?.$id && showRedeploy}
    <RedeployModal
        selectedDeploymentId={selectedSite.deploymentId}
        bind:show={showRedeploy}
        site={selectedSite} />
{/if}
