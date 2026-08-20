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
    import { Icon, Layout, Tooltip } from '@appwrite.io/pink-svelte';
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
    import { realtime } from '$lib/stores/sdk';
    import { page } from '$app/state';
    import {
        BODY_TOOLTIP_MAX_WIDTH,
        BODY_TOOLTIP_WRAPPER_STYLE_PRELINE
    } from '$lib/helpers/tooltipContent';

    export let data;

    let show = false;

    $: isLimited = isServiceLimited('sites', $organization, data.siteList?.total);

    $: $registerCommands([
        {
            label: 'Create site',
            callback: () => {
                show = true;
            },
            keys: ['c'],
            disabled: isLimited || !$canWriteSites,
            icon: IconPlus,
            group: 'sites'
        }
    ]);

    $updateCommandGroupRanks({ sites: 1000 });

    onMount(() => {
        return realtime.forConsole(page.params.region, 'console', (response) => {
            if (response.events.includes('sites.*')) {
                invalidate(Dependencies.SITES);
            }
        });
    });
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <ViewSelector
                ui="new"
                {columns}
                view={data.view}
                hideColumns
                hideView={!data.siteList.total} />
            {#if $canWriteSites}
                <Tooltip disabled={!isLimited} maxWidth={BODY_TOOLTIP_MAX_WIDTH}>
                    <div>
                        <Button
                            disabled={isLimited}
                            on:mousedown={() => {
                                if (!isLimited) show = true;
                            }}
                            event="create_site"
                            size="s">
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Create site
                        </Button>
                    </div>
                    <svelte:fragment slot="tooltip">
                        <div style={BODY_TOOLTIP_WRAPPER_STYLE_PRELINE}>
                            You have reached the maximum number of sites for your plan.
                        </div>
                    </svelte:fragment>
                </Tooltip>
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
            allowCreate={$canWriteSites && !isLimited}
            href="https://appwrite.io/docs/products/sites"
            description="Deploy and manage your web applications with Sites. "
            target="site"
            src={$app.themeInUse === 'dark' ? EmptyDark : EmptyLight}
            on:click={() => {
                if (!isLimited) show = true;
            }}>
        </Empty>
    {/if}
</Container>

<CreateSiteModal bind:show />
