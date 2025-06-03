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
    import { Card, Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { app } from '$lib/stores/app';
    import CreateSiteModal from './createSiteModal.svelte';
    import EmptyLight from './(images)/empty-sites-light.svg';
    import EmptyDark from './(images)/empty-sites-dark.svg';
    import EmptyLightMobile from './(images)/empty-sites-light-mobile.svg';
    import EmptyDarkMobile from './(images)/empty-sites-dark-mobile.svg';
    import Grid from './grid.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';
    import Table from './table.svelte';
    import { onMount } from 'svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { sdk } from '$lib/stores/sdk';
    import { isSmallViewport } from '$lib/stores/viewport';

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

    $: isDark = $app.themeInUse === 'dark';
    $: imgSrc = isDark
        ? $isSmallViewport
            ? EmptyDarkMobile
            : EmptyDark
        : $isSmallViewport
          ? EmptyLightMobile
          : EmptyLight;
    $: imgClass = $isSmallViewport ? 'mobile' : 'desktop';
</script>

<Container>
    {#if data.sitesLive}
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
                description="Deploy and manage your web your web applications with Sites. "
                target="site"
                src={$app.themeInUse === 'dark' ? EmptyDark : EmptyLight}
                on:click={() => (show = true)}>
            </Empty>
        {/if}
    {:else}
        <Card.Base padding="m">
            <Layout.Stack gap="xxl">
                <img src={imgSrc} alt="create" aria-hidden="true" height="242" class={imgClass} />

                <Layout.Stack>
                    <Layout.Stack gap="m" alignItems="center">
                        <Typography.Title size="s" align="center" color="--fgcolor-neutral-primary">
                            Appwrite Sites is in high demand
                        </Typography.Title>

                        <div style:max-width="600px">
                            <Typography.Text align="center" color="--fgcolor-neutral-secondary">
                                To ensure a smooth experience for everyone, we’re rolling out access
                                gradually.
                            </Typography.Text>
                        </div>
                    </Layout.Stack>
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    {/if}
</Container>

<CreateSiteModal bind:show />
