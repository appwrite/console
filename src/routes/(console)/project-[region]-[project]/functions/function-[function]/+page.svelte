<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { PaginationWithLimit, EmptyFilter } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { columns, deploymentList, func } from './store';
    import { Container, ResponsiveContainerHeader } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import Table from './table.svelte';
    import DeploymentCard from './(components)/deploymentCard.svelte';
    import RedeployModal from './(modals)/redeployModal.svelte';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { ActionMenu, Alert, Card, Empty, Icon, Layout } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        IconDotsHorizontal,
        IconPlus,
        IconRefresh,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { app } from '$lib/stores/app';
    import CreateActionMenu from './(components)/createActionMenu.svelte';
    import { Menu } from '$lib/components/menu';
    import DownloadActionMenuItem from './(components)/downloadActionMenuItem.svelte';

    export let data;

    let showRedeploy = false;
    let showAlert = true;

    let selectedDeployment: Models.Deployment = null;
</script>

<Container>
    {#if !data?.deploymentList?.total && !data?.query}
        <Card.Base padding="none">
            <Empty
                title="Create your first deployment"
                src={$app.themeInUse === 'dark'
                    ? `${base}/images/empty-deployment-dark.svg`
                    : `${base}/images/empty-deployment-light.svg`}>
                <span slot="description"> Need a hand? Learn more in our documentation </span>
                <span slot="actions">
                    <Button
                        external
                        href="https://appwrite.io/docs/products/functions/deployment"
                        text
                        event="empty_documentation"
                        ariaLabel={`create deployment`}>Documentation</Button>
                    <CreateActionMenu let:toggle installations={data.installations}>
                        <Button secondary on:click={toggle} event="create_deployment">
                            Create deployment
                        </Button>
                    </CreateActionMenu>
                </span>
            </Empty>
        </Card.Base>
    {:else}
        {@const activeDeployment = data?.activeDeployment}

        {#if activeDeployment && !$func.live && showAlert}
            {@const latestDeployment = data.deploymentList.deployments[0]}
            {#if latestDeployment?.status === 'failed' || latestDeployment?.status === 'ready'}
                <Alert.Inline status="warning" dismissible on:dismiss={() => (showAlert = false)}>
                    Some configuration changes are not live yet. Redeploy your function to apply
                    latest changes.
                    <svelte:fragment slot="actions">
                        <Button
                            compact
                            on:click={() => {
                                selectedDeployment = activeDeployment;
                                showRedeploy = true;
                            }}>
                            Redeploy
                        </Button>
                    </svelte:fragment>
                </Alert.Inline>
            {:else}
                <Alert.Inline status="info" dismissible on:dismiss={() => (showAlert = false)}>
                    Some configuration changes are not live yet. Your function is currently
                    redeploying — changes will be applied once the build is complete.
                </Alert.Inline>
            {/if}
        {/if}
        <Layout.Stack gap="xxxl">
            {#if activeDeployment}
                <DeploymentCard
                    deployment={activeDeployment}
                    proxyRuleList={data.proxyRuleList}
                    activeDeployment>
                    {#snippet footer()}
                        <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                            <Menu>
                                <Button secondary icon text>
                                    <Icon icon={IconDotsHorizontal} />
                                </Button>
                                <svelte:fragment slot="menu" let:toggle>
                                    <ActionMenu.Root>
                                        {#if $canWriteFunctions}
                                            <ActionMenu.Item.Button
                                                trailingIcon={IconRefresh}
                                                on:click={() => {
                                                    selectedDeployment = activeDeployment;
                                                    showRedeploy = true;
                                                    trackEvent(Click.FunctionsRedeployClick);
                                                    toggle();
                                                }}>
                                                Redeploy
                                            </ActionMenu.Item.Button>
                                        {/if}
                                        <DownloadActionMenuItem
                                            deployment={activeDeployment}
                                            {toggle} />
                                        <ActionMenu.Item.Anchor
                                            trailingIcon={IconTerminal}
                                            href={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/deployment-${activeDeployment.$id}`}>
                                            Build logs
                                        </ActionMenu.Item.Anchor>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Menu>
                            <Button
                                secondary
                                href={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${$func.$id}/executions/execute-function`}
                                disabled={isCloud && $readOnly && !GRACE_PERIOD_OVERRIDE}>
                                Execute
                            </Button>
                        </Layout.Stack>
                    {/snippet}
                </DeploymentCard>
            {:else if data.activeDeployment?.status === 'building'}
                <Card.Base padding="none">
                    <Empty
                        title="Deployment is still building"
                        src={$app.themeInUse === 'dark'
                            ? `${base}/images/empty-deployment-dark.svg`
                            : `${base}/images/empty-deployment-light.svg`}>
                        <span slot="description">
                            Your build is running. When it completes, this page will automatically
                            update with the latest deployment.
                        </span>
                        <span slot="actions">
                            <Button
                                external
                                href="https://appwrite.io/docs/products/functions/deployment"
                                text
                                event="empty_documentation"
                                ariaLabel={`create deployment`}>Documentation</Button>
                            <Button
                                secondary
                                href={`${base}/project-${page.params.region}-${page.params.project}/functions/function-${page.params.function}/deployments/deplyoment-${activeDeployment?.$id}`}>
                                View logs</Button>
                        </span>
                    </Empty>
                </Card.Base>
            {:else}
                <Card.Base padding="none">
                    <Empty
                        title="There is no active deployment"
                        src={$app.themeInUse === 'dark'
                            ? `${base}/images/empty-deployment-dark.svg`
                            : `${base}/images/empty-deployment-light.svg`}>
                        <span slot="description">
                            Deploy your function to get started. Once deployed, you'll see your
                            latest build details here.
                        </span>
                        <span slot="actions">
                            <Button
                                external
                                href="https://appwrite.io/docs/products/functions/deployment"
                                text
                                event="empty_documentation"
                                ariaLabel={`create deployment`}>Documentation</Button>
                            <CreateActionMenu let:toggle installations={data.installations}>
                                <Button secondary on:click={toggle} event="create_deployment">
                                    Create deployment
                                </Button>
                            </CreateActionMenu>
                        </span>
                    </Empty>
                </Card.Base>
            {/if}

            <Layout.Stack gap="l">
                <ResponsiveContainerHeader
                    hasFilters
                    {columns}
                    hideView
                    analyticsSource="function_deployments">
                    <CreateActionMenu let:toggle installations={data.installations}>
                        <Button on:click={toggle} event="create_deployment">
                            <Icon icon={IconPlus} size="s" slot="start" />
                            Create deployment
                        </Button>
                    </CreateActionMenu>
                </ResponsiveContainerHeader>

                {#if data.deploymentList.total}
                    <Table columns={$columns} {data} />
                {:else if data?.query}
                    <EmptyFilter resource="deployments" />
                {/if}

                {#if $deploymentList.total}
                    <PaginationWithLimit
                        name="Deployments"
                        limit={data.limit}
                        offset={data.offset}
                        total={$deploymentList?.total} />
                {/if}
            </Layout.Stack>
        </Layout.Stack>
    {/if}
</Container>

{#if selectedDeployment}
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
