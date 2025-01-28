<script lang="ts">
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import {
        Empty,
        EmptySearch,
        PaginationWithLimit,
        SearchQuery,
        ViewSelector
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { isServiceLimited } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Icon, Image, Layout } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import CreateSiteModal from './createSiteModal.svelte';
    import EmptyLight from './(images)/empty-light.png';
    import { app } from '$lib/stores/app';
    import EmptyDark from './(images)/empty-dark.png';
    import Grid from './grid.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
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
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search sites" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector {columns} view={data.view} hideColumns hideView={!data.siteList.total} />
            {#if $canWriteSites}
                <Button on:mousedown={() => (show = true)} event="create_site" size="s">
                    <Icon icon={IconPlus} />
                    Create site
                </Button>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
    {#if data.siteList.total}
        {#if data.view === View.Grid}
            <Grid siteList={data.siteList} />
        {:else}
            <Table siteList={data.siteList} />
        {/if}
        <PaginationWithLimit
            name="Sites"
            limit={data.limit}
            offset={data.offset}
            total={data.siteList.total} />
    {:else if data.search}
        <EmptySearch target="sites" />
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
