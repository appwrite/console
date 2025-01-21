<script lang="ts">
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Empty, PaginationWithLimit } from '$lib/components';
    import { Container, ContainerHeader } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    // import { templatesList } from '$lib/stores/templates';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Icon, Popover, Image, ActionMenu } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import {
        IconCog,
        IconDotsHorizontal,
        IconGlobeAlt,
        IconRefresh
    } from '@appwrite.io/pink-icons-svelte';
    import { Card } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import CreateSiteModal from './createSiteModal.svelte';
    import { timeFromNow } from '$lib/helpers/date';
    import EmptyLight from './(images)/empty-light.png';
    import { app } from '$lib/stores/app';
    import EmptyDark from './(images)/empty-dark.png';

    export let data;
    let show = false;

    $: $registerCommands([
        {
            label: 'Create site',
            callback: () => {
                show = true;
            },
            keys: ['c'],
            disabled:
                $wizard.show ||
                isServiceLimited('sites', $organization?.billingPlan, data.siteList?.total) ||
                !$canWriteSites,
            icon: 'plus',
            group: 'sites'
        }
    ]);

    $updateCommandGroupRanks({ sites: 1000 });

    // TODO: remove
    const TMPSITEROLES = true;

    $: console.log(data.siteList);
</script>

<Container>
    <ContainerHeader
        title="Sites"
        buttonText={TMPSITEROLES ? 'Create site' : ''}
        buttonEvent="create_site"
        buttonMethod={() => (show = true)}
        total={data.siteList.total} />
    {#if data.siteList.total}
        <section class="sites-grid">
            {#each data.siteList.sites as site}
                <Card.Link
                    href={`${base}/project-${$page.params.project}/sites/site-${site.$id}`}
                    padding="xxs">
                    <Card.Media
                        title={site.name}
                        description={`Deployed ${timeFromNow(site.$updatedAt)}`}
                        src={site.preview ??
                            `https://placehold.co/600x400/111/bbb?text=Screenshot+coming+soon&font=inter`}
                        alt={site.name}>
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
                            <svelte:fragment slot="tooltip">
                                <ActionMenu.Root>
                                    <ActionMenu.Item.Button leadingIcon={IconRefresh} disabled>
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

        <PaginationWithLimit
            name="Sites"
            limit={data.limit}
            offset={data.offset}
            total={data.siteList.total} />
    {:else}
        <Empty
            single
            allowCreate={TMPSITEROLES}
            href="https://appwrite.io/docs/products/sites"
            target="site"
            on:click={() => (show = true)}>
            <svelte:fragment slot="media">
                {#if $app.themeInUse === 'dark'}
                    <Image src={EmptyDark} alt="Empty state" height={235} width={1079} />
                {:else}
                    <Image src={EmptyLight} alt="Empty state" height={235} width={1079} />
                {/if}
            </svelte:fragment>
        </Empty>
    {/if}
</Container>

<CreateSiteModal bind:show />

<style lang="scss">
    .sites-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(237.5px, 1fr));
        gap: 1rem;
    }
</style>
