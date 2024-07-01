<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import {
        CardGrid,
        Empty,
        Heading,
        Id,
        PaginationWithLimit,
        Alert,
        ViewSelector
    } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { deploymentList, func, proxyRuleList } from './store';
    import { Container, ContainerHeader } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { Models } from '@appwrite.io/console';
    import Create from './create.svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Pill } from '$lib/elements';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { readOnly } from '$lib/stores/billing';
    import { project } from '../../store';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import Table from './table.svelte';
    import { Filters, TagList } from '$lib/components/filters';
    import { queries, tags } from '$lib/components/filters/store';
    import { View } from '$lib/helpers/load';

    export let data;

    let showRedeploy = false;
    let showAlert = true;

    let selectedDeployment: Models.Deployment = null;

    const columns = writable<Column[]>([
        { id: '$id', title: 'Deployment ID', type: 'string', show: true, width: 150 },
        {
            id: 'status',
            title: 'Status',
            type: 'enum',
            show: true,
            width: 110,
            array: true,
            format: 'enum',
            elements: ['ready', 'processing', 'building', 'cancelled', 'failed']
            // processing", "building", "waiting", "ready","failed
        },
        {
            id: 'type',
            title: 'Source',
            type: 'string',
            show: true,
            width: 90,
            array: true,
            format: 'enum',
            elements: ['manual', 'cli', 'vcs']
        },
        {
            id: '$updatedAt',
            title: 'Updated',
            type: 'datetime',
            show: true,
            width: 150,
            format: 'datetime'
        },

        {
            id: 'buildTime',
            title: 'Build time',
            type: 'string',
            show: true,
            width: 80,
            format: 'string'
        },
        {
            id: 'size',
            title: 'Size',
            type: 'integer',
            show: true,
            width: 80,
            format: 'integer'
        }
    ]);
</script>

<Container>
    <ContainerHeader title="Deployments">
        <Create main />
    </ContainerHeader>
    {#if data?.activeDeployment}
        {@const activeDeployment = data.activeDeployment}
        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if activeDeployment && !$func.live && showAlert}
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
        {#if activeDeployment}
            <CardGrid>
                <div class="u-flex u-cross-start u-gap-16">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
                        <p><b>Deployment ID</b></p>

                        <Id value={activeDeployment.$id}>
                            {activeDeployment.$id}
                        </Id>
                    </div>
                </div>
                <svelte:fragment slot="aside">
                    {@const status = activeDeployment.status}
                    {@const fileSize = humanFileSize(activeDeployment.size)}
                    <div class="u-flex u-main-space-between">
                        <div class="u-grid-equal-row-size u-gap-4 u-line-height-1">
                            <p><b>Build time:</b> {calculateTime(activeDeployment.buildTime)}</p>
                            <p>
                                <b>Updated:</b>
                                <DeploymentCreatedBy deployment={activeDeployment} />
                            </p>
                            <p><b>Size:</b> {fileSize.value + fileSize.unit}</p>
                            <p class="u-flex u-gap-4 u-cross-center">
                                <b>Source:</b>
                                <DeploymentSource deployment={activeDeployment} />
                            </p>
                            {#if $proxyRuleList?.rules?.length}
                                <p class="u-flex u-gap-4 u-cross-center">
                                    <b>Domains:</b>
                                    <DeploymentDomains domain={$proxyRuleList} />
                                </p>
                            {/if}
                        </div>
                        <div class="u-flex u-flex-vertical u-cross-end">
                            <Pill
                                danger={status === 'failed'}
                                warning={status === 'building'}
                                success={status === 'ready'}>
                                <span class="text u-trim">
                                    {activeDeployment.status === 'ready'
                                        ? 'active'
                                        : activeDeployment.status}
                                </span>
                            </Pill>
                        </div>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <div class="u-flex u-flex-wrap">
                        <Button
                            text
                            href={`/console/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${activeDeployment.$id}`}>
                            Build logs
                        </Button>
                        <Button
                            text
                            class="u-margin-inline-end-16"
                            on:click={() => {
                                selectedDeployment = activeDeployment;
                                showRedeploy = true;
                            }}>
                            Redeploy
                        </Button>

                        <Button
                            secondary
                            href={`${base}/console/project-${$project.$id}/functions/function-${$func.$id}/executions/execute-function`}
                            disabled={isCloud && $readOnly && !GRACE_PERIOD_OVERRIDE}>
                            Execute now
                        </Button>
                    </div>
                </svelte:fragment>
            </CardGrid>
        {:else if $deploymentList.total}
            <Empty noMedia single>
                <Create secondary round>
                    <i class="icon-plus" />
                </Create>
                <div class="u-text-center">
                    <p class="body-text-2 u-margin-block-start-4">
                        Add a new deployment, or activate an existing one to see your function in
                        action. <br />Learn more about deployments in our
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
        {:else}
            <Empty single target="deployment">
                <div class="u-text-center">
                    <Heading size="7" tag="h2">
                        Create your first deployment to get started.
                    </Heading>
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
                        ariaLabel={`create {target}`}>Documentation</Button>
                    <Create secondary />
                </div>
            </Empty>
        {/if}
        <div class="common-section">
            <Heading tag="h3" size="7">All</Heading>
            <div class="u-flex u-main-space-between is-not-mobile u-margin-block-start-16">
                <div class="u-flex u-gap-8 u-cross-center u-flex-wrap">
                    <TagList />

                    <Filters query={data.query} {columns} let:disabled let:toggle singleCondition>
                        <div class="u-flex u-gap-4">
                            <Button text on:click={toggle} {disabled} ariaLabel="open filter">
                                <span class="icon-filter-line" />
                                {#if !$tags?.length}
                                    <span class="text">Filters</span>
                                {/if}
                            </Button>
                            {#if $tags?.length}
                                <div
                                    style="flex-basis:1px; background-color:hsl(var(--color-border)); width: 1px">
                                </div>
                                <Button
                                    text
                                    on:click={() => {
                                        queries.clearAll();
                                        queries.apply();
                                    }}>
                                    Clear all
                                </Button>
                            {/if}
                        </div>
                    </Filters>
                </div>
                <div class="u-flex u-gap-16">
                    <ViewSelector
                        view={View.Table}
                        {columns}
                        hideView
                        allowNoColumns
                        showColsTextMobile />
                </div>
            </div>
            <div class="u-flex u-main-space-between u-margin-block-start-16 is-only-mobile">
                <Filters query={data.query} {columns}>
                    <svelte:fragment slot="mobile" let:disabled let:toggle>
                        <Button text on:click={toggle} {disabled} ariaLabel="open filter" noMargin>
                            <span class="icon-filter-line" />
                            <span class="text">Filters</span>
                            {#if $tags?.length}
                                <span class="inline-tag">{$tags?.length}</span>
                            {/if}
                        </Button>
                    </svelte:fragment>
                </Filters>
                <ViewSelector view={View.Table} {columns} hideView allowNoColumns />
            </div>
        </div>
        {#if $deploymentList.total}
            <div class="u-margin-block-start-24">
                <Table columns={$columns} {data} />
            </div>
        {:else}
            <Empty single target="deployment" on:click>
                <div class="u-text-center">
                    <Heading size="7" tag="h2">
                        You have no deployments. Create one to see it here.
                    </Heading>
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
                        ariaLabel={`create {target}`}>Documentation</Button>
                    <Create />
                </div>
            </Empty>
        {/if}
    {:else}
        <Empty single target="deployment">
            <div class="u-text-center">
                <Heading size="7" tag="h2">Create your first deployment to get started.</Heading>
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
                    ariaLabel={`create {target}`}>Documentation</Button>
                <Create secondary />
            </div>
        </Empty>
    {/if}

    <PaginationWithLimit
        name="Deployments"
        limit={data.limit}
        offset={data.offset}
        total={$deploymentList?.total} />
</Container>
