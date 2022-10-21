<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import {
        CardGrid,
        Pagination,
        Copy,
        DropList,
        DropListItem,
        Empty,
        Status,
        Heading
    } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText
    } from '$lib/elements/table';
    import { deploymentList, execute, func } from './store';
    import { Container } from '$lib/layout';
    import Create from './create.svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { pageLimit } from '$lib/stores/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import Delete from './delete.svelte';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import Activate from './activate.svelte';
    import { Query } from '@aw-labs/appwrite-console';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { log } from '$lib/stores/logs';

    let search = '';
    let offset = 0;
    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;

    let selectedDeployment: Models.Deployment = null;

    const functionId = $page.params.function;

    const handleActivate = () => {
        func.load(functionId);
    };

    function loadDeployments() {
        deploymentList.load(
            functionId,
            [Query.offset(offset), Query.limit($pageLimit), Query.orderDesc('$createdAt')],
            search
        );
    }

    $: deploymentList.load(
        functionId,
        [Query.offset(offset), Query.limit($pageLimit), Query.orderDesc('$createdAt')],
        search
    );
    $: if (search) offset = 0;
    $: activeDeployment = $deploymentList?.deployments?.find((d) => d.$id === $func?.deployment);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Deployments</Heading>
        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create deployment</span>
        </Button>
    </div>
    {#if $deploymentList?.total}
        <div class="common-section">
            <Heading tag="h3" size="7">Active</Heading>
        </div>
        {#if activeDeployment}
            <CardGrid>
                <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
                    <div class="avatar is-medium">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${
                                $func.runtime.split('-')[0]
                            }.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <p><b>Function ID: {$func.$id} </b></p>
                        <p>Deployment ID: {$func.deployment}</p>
                    </div>
                </div>
                <svelte:fragment slot="aside">
                    <div class="u-flex u-main-space-between">
                        <div>
                            <p>Created at: {toLocaleDateTime($func.$createdAt)}</p>
                            <p>Updated at: {toLocaleDateTime($func.$updatedAt)}</p>
                            <p>Entrypoint: {activeDeployment?.entrypoint}</p>
                        </div>

                        <Status status={activeDeployment.status}>
                            {activeDeployment.status}
                        </Status>
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button
                        text
                        on:click={() => {
                            $log.show = true;
                            $log.func = $func;
                            $log.data = activeDeployment;
                        }}>Logs</Button>
                    <Button secondary on:click={() => execute.set($func)}>Execute now</Button>
                </svelte:fragment>
            </CardGrid>
        {:else}
            <Empty single isButton on:click={() => (showCreate = true)}>
                <div class="u-text-center">
                    <p>
                        Create a new deployment, or activate an existing one to see your function in
                        action.
                    </p>
                    <p>Need a hand? Check out our documentation.</p>
                </div>
                <div class="u-flex u-gap-12">
                    <Button text external href="https://appwrite.io/docs/functions#createFunction">
                        Documentation
                    </Button>
                    <Button secondary on:click={() => (showCreate = true)}>
                        Create Deployment
                    </Button>
                </div>
            </Empty>
        {/if}

        <div class="common-section">
            <Heading tag="h3" size="7">Inactive</Heading>
        </div>

        <Table>
            <TableHeader>
                <TableCellHead>Deployment ID</TableCellHead>
                <TableCellHead width={140}>Created</TableCellHead>
                <TableCellHead width={100}>Status</TableCellHead>
                <TableCellHead width={90}>Build time</TableCellHead>
                <TableCellHead width={70}>Size</TableCellHead>
                <TableCellHead width={60} />
                <TableCellHead width={25} />
            </TableHeader>
            <TableBody>
                {#each $deploymentList.deployments as deployment, index}
                    {#if deployment.$id !== $func.deployment}
                        <TableRow>
                            <TableCell title="Deployment ID">
                                <Copy value={deployment.$id}>
                                    <Pill button>
                                        <span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim">{deployment.$id}</span>
                                    </Pill>
                                </Copy>
                            </TableCell>
                            <TableCellText title="Created">
                                {toLocaleDateTime(deployment.$createdAt)}
                            </TableCellText>

                            <TableCell title="Status">
                                <Status status={deployment.status}>
                                    {deployment.status}
                                </Status>
                            </TableCell>
                            <!-- TODO: replace with build time, when implemented -->
                            <TableCellText title="Build Time">TBI</TableCellText>
                            <TableCellText title="Size">
                                {calculateSize(deployment.size)}
                            </TableCellText>
                            <TableCell>
                                <Button
                                    secondary
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        showActivate = true;
                                    }}>
                                    <span class="text">Activate</span>
                                </Button>
                            </TableCell>
                            <TableCell showOverflow>
                                <DropList
                                    bind:show={showDropdown[index]}
                                    position="bottom"
                                    horizontal="left"
                                    arrow={false}>
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
                                            icon="terminal"
                                            on:click={() => {
                                                selectedDeployment = deployment;
                                                $log.show = true;
                                                $log.func = $func;
                                                $log.data = activeDeployment;
                                                showDropdown = [];
                                            }}>Output</DropListItem>
                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                selectedDeployment = deployment;
                                                showDropdown = [];
                                                showDelete = true;
                                            }}>Delete</DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </TableRow>
                    {/if}
                {/each}
            </TableBody>
        </Table>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div class="u-text-center">
                <p>
                    Create a new deployment, or activate an existing one to see your function in
                    action.
                </p>
                <p>Need a hand? Check out our documentation.</p>
            </div>
            <div class="u-flex u-gap-12">
                <Button text external href="https://appwrite.io/docs/functions#createFunction">
                    Documentation
                </Button>
                <Button secondary on:click={() => (showCreate = true)}>Create Deployment</Button>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$deploymentList?.total}</p>
        <Pagination limit={$pageLimit} bind:offset sum={$deploymentList?.total} />
    </div>
</Container>

<Create bind:showCreate on:created={loadDeployments} />

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
{/if}
