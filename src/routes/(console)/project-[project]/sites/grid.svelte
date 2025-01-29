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
    import { ActionMenu, Card, Icon, Popover } from '@appwrite.io/pink-svelte';
    import RedeployModal from './redeployModal.svelte';
    import { getFrameworkIcon } from './store';
    import { SvgIcon } from '$lib/components';

    export let siteList: Models.SiteList;

    let showRedeploy = false;
    let selectedSite: Models.Site = null;
</script>

<section class="sites-grid">
    {#each siteList.sites as site}
        <Card.Link
            href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}
            padding="xxs">
            <Card.Media
                title={site.name}
                description={`Updated ${timeFromNow(site.$updatedAt)}`}
                src={site.preview ??
                    `https://placehold.co/600x400/111/bbb?text=Screenshot+coming+soon&font=inter`}
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
</section>

{#if selectedSite?.$id && showRedeploy}
    <RedeployModal
        selectedDeploymentId={selectedSite.deploymentId}
        bind:show={showRedeploy}
        site={selectedSite} />
{/if}

<style lang="scss">
    .sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(237.5px, 1fr));
        gap: 1rem;
    }
</style>
