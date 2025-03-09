<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { PaginationWithLimit, ViewSelector, EmptyFilter } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { columns, deploymentList, func } from './store';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import Table from './table.svelte';
    import { Filters } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';
    import DeploymentCard from './(components)/deploymentCard.svelte';
    import RedeployModal from './(modals)/redeployModal.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { canWriteFunctions } from '$lib/stores/roles';
    import {
        ActionMenu,
        Alert,
        Card,
        Empty,
        Icon,
        Layout,
        Popover
    } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        IconDotsHorizontal,
        IconFilterLine,
        IconPlus,
        IconRefresh,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';
    import { app } from '$lib/stores/app';
    import CreateActionMenu from './(components)/createActionMenu.svelte';

    export let data;

    let showRedeploy = false;
    let showAlert = true;

    let selectedDeployment: Models.Deployment = null;

    function clearAll() {
        queries.clearAll();
        queries.apply();
    }
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
                    <CreateActionMenu let:toggle>
                        <Button secondary on:click={toggle} event="create_deployment">
                            Create deployment
                        </Button>
                    </CreateActionMenu>
                </span>
            </Empty>
        </Card.Base>
    {:else}
        {@const activeDeployment = data.activeDeployment}

        {#if data?.activeDeployment && !$func.live && showAlert}
            <Alert.Inline status="warning" dismissible on:dismiss={() => (showAlert = false)}>
                Some configuration options are not live yet. Redeploy your function to apply latest
                changes.
            </Alert.Inline>
        {/if}
        <Layout.Stack gap="xxxl">
            {#if activeDeployment}
                <DeploymentCard
                    deployment={activeDeployment}
                    proxyRuleList={data.proxyRuleList}
                    activeDeployment>
                    <svelte:fragment slot="footer">
                        <Layout.Stack direction="row" gap="s" alignItems="center" inline>
                            <Popover let:toggle placement="bottom-start" padding="none">
                                <Button secondary icon text on:click={toggle}>
                                    <Icon icon={IconDotsHorizontal} size="s" />
                                </Button>
                                <svelte:fragment slot="tooltip" let:toggle>
                                    <ActionMenu.Root>
                                        {#if $canWriteFunctions}
                                            <ActionMenu.Item.Button
                                                trailingIcon={IconRefresh}
                                                on:click={(e) => {
                                                    selectedDeployment = activeDeployment;
                                                    showRedeploy = true;
                                                    trackEvent(Click.FunctionsRedeployClick);
                                                    toggle(e);
                                                }}>
                                                Redeploy
                                            </ActionMenu.Item.Button>
                                        {/if}
                                        <ActionMenu.Item.Anchor
                                            trailingIcon={IconTerminal}
                                            href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${activeDeployment.$id}`}>
                                            Build logs
                                        </ActionMenu.Item.Anchor>
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                            <Button
                                secondary
                                href={`${base}/project-${$page.params.project}/functions/function-${$func.$id}/executions/execute-function`}
                                disabled={isCloud && $readOnly && !GRACE_PERIOD_OVERRIDE}>
                                Execute
                            </Button>
                        </Layout.Stack>
                    </svelte:fragment>
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
                                href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/deployments/deplyoment-${activeDeployment?.$id}`}>
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
                            <CreateActionMenu let:toggle>
                                <Button secondary on:click={toggle} event="create_deployment">
                                    Create deployment
                                </Button>
                            </CreateActionMenu>
                        </span>
                    </Empty>
                </Card.Base>
            {/if}

            <Layout.Stack gap="l">
                <Layout.Stack direction="row" alignItems="center">
                    <Layout.Stack direction="row" gap="s" wrap="wrap">
                        {#if data.deploymentList.total}
                            <QuickFilters {columns} />
                            <Filters
                                query={data.query}
                                {columns}
                                let:disabled
                                let:toggle
                                singleCondition
                                analyticsSource="function_filters">
                                <div class="u-flex u-gap-4">
                                    <Button
                                        text
                                        on:click={toggle}
                                        {disabled}
                                        ariaLabel="open filter"
                                        compact={!$tags?.length}>
                                        <Icon icon={IconFilterLine} size="s" slot="start" />
                                        <span class="text">More filters</span>
                                    </Button>
                                    {#if $tags?.length}
                                        <div
                                            style="flex-basis:1px; background-color:hsl(var(--border)); width: 1px">
                                        </div>
                                        <Button text on:click={clearAll}>Clear all</Button>
                                    {/if}
                                </div>
                            </Filters>
                        {/if}
                    </Layout.Stack>
                    <Layout.Stack direction="row" gap="s" inline>
                        {#if data.deploymentList.total}
                            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                        {/if}
                        <CreateActionMenu let:toggle>
                            <Button on:click={toggle} event="create_deployment">
                                <Icon icon={IconPlus} size="s" slot="start" />
                                Create deployment
                            </Button>
                        </CreateActionMenu>
                    </Layout.Stack>
                </Layout.Stack>

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
