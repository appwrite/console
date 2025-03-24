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
    import { canWriteSites } from '$lib/stores/roles.js';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import CreateSiteModal from './createSiteModal.svelte';
    import EmptyLight from './(images)/empty-sites-light.svg';
    import EmptyDark from './(images)/empty-sites-dark.svg';
    import Grid from './grid.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
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
                isServiceLimited('sites', $organization?.billingPlan, data.siteList?.total) ||
                !$canWriteSites,
            icon: IconPlus,
            group: 'sites'
        }
    ]);

    $updateCommandGroupRanks({ sites: 1000 });

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes(`sites.*`)) {
                invalidate(Dependencies.SITES);
            }
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery search={data.search} placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector {columns} view={data.view} hideColumns hideView={!data.siteList.total} />
            {#if $canWriteSites}
                <Button on:mousedown={() => (show = true)} event="create_site" size="s">
                    <Icon icon={IconPlus} slot="start" size="s" />
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
            allowCreate={$canWriteSites}
            href="https://appwrite.io/docs/products/sites"
            description="Deploy, manage, and scale your web applications effortlessly with Sites. "
            target="site"
            src={$app.themeInUse === 'dark' ? EmptyDark : EmptyLight}
            on:click={() => (show = true)}>
        </Empty>
    {/if}
</Container>

<CreateSiteModal bind:show />
