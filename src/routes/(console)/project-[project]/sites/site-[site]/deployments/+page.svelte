<script lang="ts">
    import { PaginationWithLimit, ViewSelector, EmptyFilter, Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { type Models } from '@appwrite.io/console';
    import { Filters } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';
    import { ActionMenu, Icon, Layout, Popover, Tag } from '@appwrite.io/pink-svelte';
    import Table from './table.svelte';
    import QuickFilters from './quickFilters.svelte';
    import RedeployModal from '../../redeployModal.svelte';
    import CreateGitDeploymentModal from './createGitDeploymentModal.svelte';
    import ConnectRepoModal from '../../(components)/connectRepoModal.svelte';
    import { columns } from './store';
    import CreateManualDeploymentModal from './createManualDeploymentModal.svelte';
    import DeploymentMetrics from './deploymentMetrics.svelte';
    import { IconFilterLine, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import CreateCliModal from './createCliModal.svelte';

    export let data;

    let showRedeploy = false;
    let showCreateDeployment = false;
    let showConnectRepo = false;
    let selectedDeployment: Models.Deployment = null;
    let hasInstallation = !!data.installations?.total;
    let showConnectCLI = false;
    let showConnectManual = false;
    let showMobileFilters = false;

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }

    onMount(() => {
        data?.query ? (showMobileFilters = true) : (showMobileFilters = false);
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('sites.*.deployments.*')) {
                invalidate(Dependencies.DEPLOYMENTS);
            }
        });
    });
</script>

<Container>
    <Layout.Stack gap="xxxl">
        {#if data.deploymentList.total}
            <DeploymentMetrics deploymentList={data.deploymentList} />
        {/if}
        <Layout.Stack gap="l">
            <Layout.Stack justifyContent="space-between" direction="row">
                <div class="is-not-mobile">
                    <Layout.Stack alignItems="center" direction="row">
                        {#if data.deploymentList.total}
                            <QuickFilters {columns} />
                            <Filters
                                query={data.query}
                                {columns}
                                let:disabled
                                let:toggle
                                singleCondition>
                                <Layout.Stack alignItems="center" direction="row" gap="xs">
                                    <Button
                                        compact
                                        on:click={toggle}
                                        {disabled}
                                        size="s"
                                        ariaLabel="open filter">
                                        <Icon icon={IconFilterLine} size="s" slot="start" />
                                        More filters
                                    </Button>
                                    {#if $tags?.length}
                                        <!-- TODO: add vertical divider to pink 2 -->
                                        <div
                                            style="flex-basis:1px; background-color:hsl(var(--color-border)); width: 1px">
                                        </div>
                                        <Button text on:click={clearAll} size="s">Clear all</Button>
                                    {/if}
                                </Layout.Stack>
                            </Filters>
                        {/if}
                    </Layout.Stack>
                </div>
                <div class="is-only-mobile">
                    <Button
                        secondary
                        size="s"
                        on:click={() => (showMobileFilters = !showMobileFilters)}
                        ariaLabel="toggle filters">
                        <span class="icon-filter-line" />
                        <span class="text">Filters</span>
                    </Button>
                    <div
                        class:u-hide={!showMobileFilters}
                        class:u-flex={showMobileFilters}
                        class=" u-gap-8 u-flex-wrap u-margin-block-start-16">
                        <QuickFilters {columns} />

                        <Filters query={data.query} {columns} clearOnClick>
                            <svelte:fragment slot="mobile" let:disabled let:toggle>
                                <Tag size="m" on:click={toggle} {disabled}>
                                    <span class="text">More filters</span>
                                    <span class="icon-cheveron-down" />
                                </Tag>
                            </svelte:fragment>
                        </Filters>
                    </div>
                </div>
                <div>
                    <Layout.Stack direction="row" inline>
                        {#if data.deploymentList.total}
                            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                        {/if}
                        <Popover let:toggle>
                            <Button size="s" on:click={toggle}>
                                <Icon size="s" icon={IconPlus} />
                                Create deployment
                            </Button>
                            <svelte:fragment slot="tooltip" let:toggle>
                                <ActionMenu.Root noPadding>
                                    <ActionMenu.Item.Button
                                        badge="Recommended"
                                        on:click={(e) => {
                                            toggle(e);
                                            if (!hasInstallation) {
                                                showConnectRepo = true;
                                            } else {
                                                showCreateDeployment = true;
                                            }
                                        }}>
                                        Git
                                    </ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        on:click={(e) => {
                                            toggle(e);
                                            showConnectCLI = true;
                                        }}>
                                        CLI
                                    </ActionMenu.Item.Button>
                                    <ActionMenu.Item.Button
                                        on:click={(e) => {
                                            toggle(e);
                                            showConnectManual = true;
                                        }}>
                                        Manual
                                    </ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </svelte:fragment>
                        </Popover>
                    </Layout.Stack>
                </div>
            </Layout.Stack>

            {#if data.deploymentList.total}
                <Table {data} />

                <PaginationWithLimit
                    name="Deployments"
                    limit={data.limit}
                    offset={data.offset}
                    total={data.deploymentList?.total} />
            {:else if data?.query}
                <EmptyFilter resource="deployments" />
            {:else}
                <Empty
                    single
                    target="deployment"
                    on:click={() => {
                        if (!hasInstallation) {
                            showConnectRepo = true;
                        } else {
                            showCreateDeployment = true;
                        }
                    }} />
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</Container>
{#if selectedDeployment}
    <RedeployModal
        selectedDeploymentId={selectedDeployment.$id}
        bind:show={showRedeploy}
        site={data.site} />
{/if}

{#if showConnectRepo}
    <ConnectRepoModal
        bind:show={showConnectRepo}
        site={data.site}
        callbackState={{ connectRepo: 'true' }} />
{/if}

{#if showCreateDeployment}
    <CreateGitDeploymentModal bind:show={showCreateDeployment} site={data.site} />
{/if}
{#if showConnectManual}
    <CreateManualDeploymentModal bind:show={showConnectManual} site={data.site} />
{/if}
{#if showConnectCLI}
    <CreateCliModal bind:show={showConnectCLI} />
{/if}
