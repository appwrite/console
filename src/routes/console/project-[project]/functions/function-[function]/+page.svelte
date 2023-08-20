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
    import { execute, func } from './store';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { calculateSize, humanFileSize } from '$lib/helpers/sizeConvertion';
    import { Query, type Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from './delete.svelte';
    import Create from './create.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import Activate from './activate.svelte';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { Pill } from '$lib/elements';
    import RedeployModal from './redeployModal.svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';

    export let data: PageData;

    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;

    let selectedDeployment: Models.Deployment = null;
    let activeDeployment: Models.Deployment = null;

    onMount(async () => {
        activeDeployment = await getActiveDeployment();
    });

    async function getActiveDeployment() {
        const list = await sdk.forProject.functions.listDeployments($page.params.function, [
            Query.equal('$id', $func?.deployment)
        ]);
        return list?.deployments?.[0];
    }

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

    $: activeDeployment = data.deployments.deployments.find((d) => d.$id === $func?.deployment);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Deployments</Heading>
        <Create main />
    </div>
    {#if data.deployments.total}
        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if activeDeployment && !$func.live}
            <div class="u-margin-block-start-8">
                <Alert type="warning" isStandalone>
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
                    </div>
                </div>
                <svelte:fragment slot="aside">
                    {@const status = activeDeployment.status}
                    {@const fileSize = humanFileSize(activeDeployment.size)}
                    <div class="u-flex u-main-space-between">
                        <div>
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
                            {#if data.domain?.rules?.length}
                                <p class="u-flex u-gap-4 u-cross-center">
                                    <b>Domains:</b>
                                    <DeploymentDomains domain={data.domain} />
                                </p>
                            {/if}
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
            <Empty single target="deployment">
                <div class="u-text-center">
                    <Heading size="7" tag="h2"
                        >Create your first deployment to get started.</Heading>
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
                    <Create secondary />
                </div>
            </Empty>
        {/if}

        <div class="common-section">
            <Heading tag="h3" size="7">All</Heading>
        </div>
        {#if data.deployments.total > 0}
            <div class="u-margin-block-start-24">
                <TableScroll noMargin>
                    <TableHeader>
                        <TableCellHead width={150}>Deployment ID</TableCellHead>
                        <TableCellHead width={100}>Status</TableCellHead>
                        <TableCellHead width={70}>Source</TableCellHead>
                        <TableCellHead width={180}>Updated</TableCellHead>
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
                                        {status}
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
            </div>
        {:else}
            <Empty single target="deployment" on:click>
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
                    href="https://appwrite.io/docs/functions#createFunction"
                    text
                    event="empty_documentation"
                    ariaLabel={`create {target}`}>Documentation</Button>
                <Create secondary />
            </div>
        </Empty>
    {/if}
    {@const sum = data.deployments.total ? data.deployments.total - 1 : 0}

    <PaginationWithLimit name="Deployments" limit={data.limit} offset={data.offset} total={sum} />
</Container>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
