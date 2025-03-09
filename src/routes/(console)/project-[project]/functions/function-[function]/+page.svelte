<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Empty, PaginationWithLimit, Alert, ViewSelector, EmptyFilter } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { columns, deploymentList, func } from './store';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import Create from './create.svelte';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import Table from './table.svelte';
    import { Filters } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';
    import DeploymentCard from './deploymentCard.svelte';
    import RedeployModal from './(modals)/redeployModal.svelte';
    import QuickFilters from './quickFilters.svelte';
    import { canWriteFunctions } from '$lib/stores/roles';
    import { ActionMenu, Icon, Layout, Popover, Typography } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        IconDotsHorizontal,
        IconFilterLine,
        IconPlus,
        IconRefresh,
        IconTerminal
    } from '@appwrite.io/pink-icons-svelte';

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
        <Empty single target="deployment">
            <div class="u-text-center">
                <Typography.Title size="s">
                    Create your first deployment to get started.
                </Typography.Title>
                <p class="body-text-2 u-bold u-margin-block-start-4">
                    Learn more about deployments in our Documentation.
                </p>
            </div>
            <div class="u-flex u-gap-16 u-main-center">
                <Button
                    external
                    href="https://appwrite.io/docs/products/functions/deployment"
                    text
                    event="empty_documentation"
                    ariaLabel={`create deployment`}>Documentation</Button>
                <Create secondary />
            </div>
        </Empty>
    {:else}
        {@const activeDeployment = data.activeDeployment}

        {#if data?.activeDeployment && !$func.live && showAlert}
            <Alert
                type="warning"
                class="u-margin-block-start-8"
                isStandalone
                dismissible
                on:dismiss={() => (showAlert = false)}>
                Some configuration options are not live yet. Redeploy your function to apply latest
                changes.
            </Alert>
        {/if}
        <Layout.Stack gap="xxxl">
            {#if activeDeployment}
                <DeploymentCard deployment={activeDeployment} proxyRuleList={data.proxyRuleList}>
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
            {:else if !$deploymentList.total && !data?.query}
                <Empty single target="deployment">
                    <div class="u-text-center">
                        <Typography.Title size="s"
                            >Create your first deployment to get started.</Typography.Title>
                        <p class="body-text-2 u-bold u-margin-block-start-4">
                            Learn more about deployments in our Documentation.
                        </p>
                    </div>
                    <div class="u-flex u-gap-16 u-main-center">
                        <Button
                            external
                            href="https://appwrite.io/docs/products/functions/deployment"
                            text
                            event="empty_documentation"
                            ariaLabel={`create deployment`}>Documentation</Button>
                        <Create secondary />
                    </div>
                </Empty>
            {:else}
                <Empty single>
                    <Create secondary round>
                        <i class="icon-plus" />
                    </Create>
                    <div class="u-text-center">
                        <p class="body-text-2 u-margin-block-start-4">
                            Add a new deployment, or activate an existing one to see your function
                            in action. <br />Learn more about deployments in our
                            <a
                                class="link"
                                target="_blank"
                                rel="noopener noreferrer"
                                href="https://appwrite.io/docs/products/functions/deployment"
                                >documentation</a
                            >.
                        </p>
                    </div>
                </Empty>
            {/if}
            <Layout.Stack gap="l">
                <Layout.Stack direction="row" alignItems="center">
                    <Layout.Stack direction="row" gap="s" wrap="wrap">
                        {#if $deploymentList.total}
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
                        {#if $deploymentList.total}
                            <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
                        {/if}
                        <Create main let:toggle>
                            <Button on:click={toggle} event="create_deployment">
                                <Icon icon={IconPlus} size="s" slot="start" />
                                Create deployment
                            </Button>
                        </Create>
                    </Layout.Stack>
                </Layout.Stack>

                {#if $deploymentList.total}
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
