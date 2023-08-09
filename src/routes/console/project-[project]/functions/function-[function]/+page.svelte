<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import {
        CardGrid,
        DropList,
        DropListItem,
        Empty,
        Heading,
        PaginationWithLimit,
        Id,
        Alert
    } from '$lib/components';
    import {
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText,
        TableScroll
    } from '$lib/elements/table';
    import { execute, func } from './store';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { calculateSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import { timeFromNow } from '$lib/helpers/date';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from './delete.svelte';
    import Activate from './activate.svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { Pill } from '$lib/elements';
    import Create from './create.svelte';
    import DropListLink from '$lib/components/dropListLink.svelte';
    import { page } from '$app/stores';
    import { tooltip } from '$lib/actions/tooltip';
    import RedeployModal from './redeployModal.svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';

    export let data: PageData;

    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;

    let selectedDeployment: Models.Deployment = null;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

    $: activeDeployment = data.deployments.deployments.find((d) => d.$id === $func?.deployment);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Deployments</Heading>
        <Create bind:showCreate />
    </div>
    {#if data.deployments.total}
        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if activeDeployment && !$func.live}
            <div class="u-margin-block-start-8">
                <Alert type="warning">
                    Some configuration options are not live yet. Redeploy your function to apply
                    latest changes.
                </Alert>
            </div>
        {/if}
        {#if activeDeployment}
            <CardGrid>
                <div class="grid-1-2-col-1 u-flex u-cross-start u-gap-16">
                    <div class="avatar is-medium" aria-hidden="true">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <div class="u-flex u-gap-12 u-cross-center">
                            <p><b>Deployment ID</b></p>
                        </div>

                        <div class="u-flex u-gap-12 u-cross-center">
                            <Id value={$func.deployment}>
                                {$func.deployment}
                            </Id>
                        </div>

                        <div class="u-flex u-gap-12 u-cross-center u-margin-block-start-12">
                            <p><b>Domain</b></p>
                        </div>

                        <div class="u-flex u-gap-12 u-cross-center">
                            <a
                                class="u-underline u-cursor-pointer"
                                href={'//' + data.domain.rules[0].domain}
                                target="_blank">
                                {data.domain.rules[0].domain}
                            </a>
                        </div>
                    </div>
                </div>
                <svelte:fragment slot="aside">
                    {@const status = activeDeployment.status}
                    {@const fileSize = humanFileSize(activeDeployment.size)}
                    <div class="u-flex u-main-space-between">
                        <div>
                            <p><b>Build time:</b> {calculateTime(activeDeployment.buildTime)}</p>
                            <p>
                                <b>Created:</b>
                                <DeploymentCreatedBy deployment={activeDeployment} />
                            </p>
                            <p><b>Size:</b> {fileSize.value + fileSize.unit}</p>
                            <p>
                                <b>Source:</b>
                                <DeploymentSource deployment={activeDeployment} />
                            </p>
                        </div>
                        <div class="u-flex u-flex-vertical u-cross-end">
                            <Pill
                                danger={status === 'failed'}
                                warning={status === 'pending'}
                                success={status === 'completed' || status === 'ready'}
                                info={status === 'processing' || status === 'building'}>
                                <span class="text u-trim">{activeDeployment.status}</span>
                            </Pill>
                        </div>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        text
                        href={`/console/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${activeDeployment.$id}`}>
                        Build logs
                    </Button>
                    <Button
                        text
                        on:click={() => {
                            selectedDeployment = activeDeployment;
                            showRedeploy = true;
                        }}>Redeploy</Button>

                    <Button secondary on:click={() => ($execute = $func)}>Execute now</Button>
                </svelte:fragment>
            </CardGrid>
        {:else}
            <Empty
                single
                href="https://appwrite.io/docs/functions#createFunction"
                target="deployment"
                on:click={() => (showCreate = true)} />
        {/if}

        <div class="common-section">
            <Heading tag="h3" size="7">All</Heading>
        </div>
        {#if data.deployments.total > 0}
            <TableScroll>
                <TableHeader>
                    <TableCellHead width={150}>Deployment ID</TableCellHead>
                    <TableCellHead width={100}>Status</TableCellHead>
                    <TableCellHead width={70}>Source</TableCellHead>
                    <TableCellHead width={180}>Created</TableCellHead>
                    <TableCellHead width={100}>Build Time</TableCellHead>
                    <TableCellHead width={70}>Size</TableCellHead>
                    <TableCellHead width={25} />
                </TableHeader>
                <TableBody>
                    {#each data.deployments.deployments as deployment, index}
                        {@const status = deployment.status}
                        <TableRow>
                            <TableCell width={150} title="Deployment ID">
                                <Id value={deployment.$id}>{deployment.$id}</Id>
                            </TableCell>
                            <TableCell width={100} title="Status">
                                <Pill
                                    danger={status === 'failed'}
                                    warning={status === 'pending'}
                                    success={status === 'completed' || status === 'ready'}
                                    info={status === 'processing' || status === 'building'}>
                                    <span
                                        class="text u-trim"
                                        use:tooltip={{
                                            content: 'Active Deployment',
                                            placement: 'top'
                                        }}>
                                        {#if deployment.$id === $func.deployment}
                                            <span class="icon-check-circle" aria-hidden="true" />
                                        {/if}
                                        <span>{status}</span></span>
                                </Pill>
                            </TableCell>
                            <TableCellText width={70} title="Source">
                                <DeploymentSource {deployment} /></TableCellText>
                            <TableCellText width={140} title="Created">
                                <DeploymentCreatedBy {deployment} />
                            </TableCellText>

                            <TableCellText width={100} title="Build Time">
                                {#if ['processing', 'building'].includes(deployment.status)}
                                    <span use:timer={{ start: deployment.$createdAt }} />
                                {:else}
                                    {calculateTime(deployment.buildTime)}
                                {/if}
                            </TableCellText>

                            <TableCellText width={70} title="Size">
                                {calculateSize(deployment.size)}
                            </TableCellText>

                            <TableCell width={25} showOverflow>
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

                                        {#if deployment.status === 'ready'}
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
                                            Output
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
        {:else}
            <Empty single target="deployment" on:click={() => (showCreate = true)}>
                <div class="u-text-center">
                    <Heading size="7" tag="h2"
                        >You have no deployments. Create one to see it here.</Heading>
                    <p class="body-text-2 u-bold u-margin-block-start-4">
                        Learn more about deployments in our Documentation.
                    </p>
                </div>
                <div class="u-flex u-gap-16 u-main-center">
                    <Button
                        external
                        href="https://appwrite.io/docs/functions#createFunction"
                        text
                        event="empty_documentation"
                        ariaLabel={`create {target}`}>Documentation</Button>
                    <Create />
                </div>
            </Empty>
        {/if}
    {:else}
        <Empty
            single
            target="deployment"
            href="https://appwrite.io/docs/functions#createFunction"
            on:click={() => (showCreate = true)} />
    {/if}
    {@const sum = data.deployments.total ? data.deployments.total - 1 : 0}

    <PaginationWithLimit name="Deployments" limit={data.limit} offset={data.offset} total={sum} />
</Container>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
