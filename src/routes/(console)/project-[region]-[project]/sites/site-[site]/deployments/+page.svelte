<script lang="ts">
    import { PaginationWithLimit, ViewSelector, EmptyFilter, Empty } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import { Adapter, BuildRuntime, Framework, type Models } from '@appwrite.io/console';
    import { View } from '$lib/helpers/load';
    import { ActionMenu, Icon, Layout, Popover } from '@appwrite.io/pink-svelte';
    import Table from './table.svelte';
    import RedeployModal from '../../redeployModal.svelte';
    import CreateGitDeploymentModal from './createGitDeploymentModal.svelte';
    import { columns } from './store';
    import CreateManualDeploymentModal from './createManualDeploymentModal.svelte';
    import DeploymentMetrics from './deploymentMetrics.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import CreateCliModal from './createCliModal.svelte';
    import { page } from '$app/state';
    import { ConnectRepoModal } from '$lib/components/git';

    export let data;

    let showRedeploy = false;
    let showCreateDeployment = false;
    let showConnectRepo = false;
    let selectedDeployment: Models.Deployment = null;
    let hasInstallation = !!data.installations?.total;
    let showConnectCLI = false;
    let showConnectManual = false;

    onMount(() => {
        if (page.url.searchParams.has('createDeployment')) {
            showConnectRepo = true;
        }

        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes('sites.*.deployments.*')) {
                invalidate(Dependencies.DEPLOYMENTS);
            }
        });
    });

    async function connect(selectedInstallationId: string, selectedRepository: string) {
        try {
            await sdk.forProject.sites.update(
                data.site.$id,
                data.site.name,
                data.site.framework as Framework,
                data.site.enabled,
                data.site.logging || undefined,
                data.site.timeout,
                data.site.installCommand,
                data.site.buildCommand,
                data.site.outputDirectory,
                data.site.buildRuntime as BuildRuntime,
                data.site.adapter as Adapter,
                data.site.fallbackFile,
                selectedInstallationId,
                selectedRepository,
                'main',
                undefined,
                undefined,
                undefined
            );
            invalidate(Dependencies.SITE);
        } catch (error) {
            console.log(error);
        }
    }
</script>

<Container>
    <Layout.Stack gap="xxxl">
        <DeploymentMetrics />

        <!-- TODO: re-enable once component is complete -->
        <Layout.Stack gap="l">
            <ResponsiveContainerHeader
                view={View.Table}
                {columns}
                hasFilters
                analyticsSource="site_deployments"
                hideView>
                <Popover padding="none" let:toggle>
                    <Button size="s" on:click={toggle}>
                        <Icon size="s" icon={IconPlus} />
                        Create deployment
                    </Button>
                    <svelte:fragment slot="tooltip" let:toggle>
                        <ActionMenu.Root>
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
            </ResponsiveContainerHeader>
            <!-- <Layout.Stack>
                <Layout.Stack justifyContent="space-between" direction="row">
                    <Layout.Stack alignItems="center" direction="row">
                        {#if data.deploymentList.total || data?.query}
                            <QuickFilters {columns} analyticsSource="site_deployments" />
                        {/if}
                    </Layout.Stack>

                    <Layout.Stack direction="row" inline>
                        {#if data.deploymentList.total}
                            <ViewSelector view={View.Table} {columns} hideView />
                        {/if}
                        <Popover padding="none" let:toggle>
                            <Button size="s" on:click={toggle}>
                                <Icon size="s" icon={IconPlus} />
                                Create deployment
                            </Button>
                            <svelte:fragment slot="tooltip" let:toggle>
                                <ActionMenu.Root>
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
                </Layout.Stack>
                <ParsedTagList />
            </Layout.Stack> -->

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
        {connect}
        product="sites"
        callbackState={{ connectRepo: 'true' }} />
{/if}

{#if showCreateDeployment}
    <CreateGitDeploymentModal
        bind:show={showCreateDeployment}
        site={data.site}
        installations={data.installations} />
{/if}
{#if showConnectManual}
    <CreateManualDeploymentModal bind:show={showConnectManual} site={data.site} />
{/if}
{#if showConnectCLI}
    <CreateCliModal bind:show={showConnectCLI} />
{/if}
