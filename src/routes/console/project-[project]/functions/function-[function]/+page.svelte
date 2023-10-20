<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { timer } from '$lib/actions/timer';
    import {
        CardGrid,
        DropList,
        DropListItem,
        DropListLink,
        Empty,
        Heading,
        Id,
        PaginationWithLimit,
        Alert
    } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { deploymentList, execute, func, proxyRuleList } from './store';
    import { Container, ContainerHeader } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { calculateSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import type { Models } from '@appwrite.io/console';
    import Delete from './delete.svelte';
    import Create from './create.svelte';
    import Activate from './activate.svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Pill } from '$lib/elements';
    import RedeployModal from './redeployModal.svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { hoursToDays } from '$lib/helpers/date';

    export let data;

    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;
    let showAlert = true;

    let selectedDeployment: Models.Deployment = null;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }
</script>

<Container>
    <ContainerHeader title="Deployments" serviceId="logs">
        <svelte:fragment slot="tooltip" let:limit let:tier let:upgradeMethod>
            <p class="text">
                You are limited to {hoursToDays(limit)} of logs on the {tier} plan.
                <button class="link" type="button" on:click|preventDefault={upgradeMethod}
                    >Upgrade</button> to increase log retention for a longer period.
            </p>
        </svelte:fragment>
        <Create main />
    </ContainerHeader>
    {#if $deploymentList?.total}
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

                        <Button secondary on:click={() => ($execute = $func)}>Execute now</Button>
                    </div>
                </svelte:fragment>
            </CardGrid>
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
        </div>
        {#if $deploymentList.total}
            <div class="u-margin-block-start-24">
                <TableScroll noMargin>
                    <TableHeader>
                        <TableCellHead width={150}>Deployment ID</TableCellHead>
                        <TableCellHead width={100}>Status</TableCellHead>
                        <TableCellHead width={80}>Source</TableCellHead>
                        <TableCellHead width={180}>Updated</TableCellHead>
                        <TableCellHead width={80}>Build Time</TableCellHead>
                        <TableCellHead width={80}>Size</TableCellHead>
                        <TableCellHead width={40} />
                    </TableHeader>
                    <TableBody>
                        {#each $deploymentList.deployments as deployment, index (deployment.$id)}
                            {@const status = deployment.status}
                            <TableRow>
                                <TableCell width={150} title="Deployment ID">
                                    <Id value={deployment.$id}>{deployment.$id}</Id>
                                </TableCell>
                                <TableCell title="Status">
                                    {#if activeDeployment?.$id === deployment?.$id}
                                        <Pill success>active</Pill>
                                    {:else}
                                        <Pill
                                            danger={status === 'failed'}
                                            warning={status === 'building'}
                                            info={status === 'ready'}>
                                            {status}
                                        </Pill>
                                    {/if}
                                </TableCell>
                                <TableCellText title="Source">
                                    <DeploymentSource {deployment} /></TableCellText>
                                <TableCellText width={180} title="Updated">
                                    <DeploymentCreatedBy {deployment} />
                                </TableCellText>

                                <TableCellText title="Build Time">
                                    {#if ['processing', 'building'].includes(deployment.status)}
                                        <span use:timer={{ start: deployment.$createdAt }} />
                                    {:else}
                                        {calculateTime(deployment.buildTime)}
                                    {/if}
                                </TableCellText>

                                <TableCellText title="Size">
                                    {calculateSize(deployment.size)}
                                </TableCellText>

                                <TableCell width={40} showOverflow>
                                    <DropList
                                        bind:show={showDropdown[index]}
                                        placement="bottom-start"
                                        noArrow>
                                        <button
                                            class="button is-only-icon is-text"
                                            aria-label="More options"
                                            on:click|preventDefault={() => {
                                                showDropdown[index] = !showDropdown[index];
                                            }}>
                                            <span class="icon-dots-horizontal" aria-hidden="true" />
                                        </button>
                                        <svelte:fragment slot="list">
                                            <DropListItem
                                                icon="refresh"
                                                on:click={() => {
                                                    selectedDeployment = deployment;
                                                    showRedeploy = true;
                                                    showDropdown = [];
                                                }}>
                                                Redeploy
                                            </DropListItem>
                                            {#if deployment.status === 'ready' && deployment.$id !== $func.deployment}
                                                <DropListItem
                                                    icon="lightning-bolt"
                                                    on:click={() => {
                                                        selectedDeployment = deployment;
                                                        showActivate = true;
                                                        showDropdown = [];
                                                    }}>
                                                    Activate
                                                </DropListItem>
                                            {/if}
                                            <DropListLink
                                                icon="terminal"
                                                href={`/console/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${deployment.$id}`}>
                                                Logs
                                            </DropListLink>
                                            <DropListItem
                                                icon="trash"
                                                on:click={() => {
                                                    selectedDeployment = deployment;
                                                    showDropdown = [];
                                                    showDelete = true;
                                                }}>
                                                Delete
                                            </DropListItem>
                                        </svelte:fragment>
                                    </DropList>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </TableScroll>
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

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
