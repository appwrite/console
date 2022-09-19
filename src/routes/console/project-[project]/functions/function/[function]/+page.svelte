<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { CardGrid, Pagination, Copy, DropList, DropListItem, Empty } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCell,
        TableCellText
    } from '$lib/elements/table';
    import { deploymentList, func } from './store';
    import { Container } from '$lib/layout';
    import Create from './_create.svelte';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { pageLimit } from '$lib/stores/layout';
    import type { Models } from '@aw-labs/appwrite-console';
    import Execute from './_execute.svelte';
    import Delete from './_delete.svelte';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import Activate from './_activate.svelte';

    let search = '';
    let offset = 0;
    let showCreate = false;
    let showDropdown = [];
    let showDelete = false;
    let showExecute = false;
    let showActivate = false;

    let selectedDeployment: Models.Deployment = null;

    const functionId = $page.params.function;

    const handleActivate = () => {
        func.load(functionId);
    };

    $: deploymentList.load(functionId, search, $pageLimit, offset ?? 0);
    $: if (search) offset = 0;
    $: activeDeployment = $deploymentList?.deployments?.find((d) => d.$id === $func?.deployment);
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <h2 class="heading-level-5">Deployments</h2>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create deployment</span>
        </Button>
    </div>
    {#if $deploymentList?.total}
        <div class="common-section">
            <h2 class="heading-level-7">Active</h2>
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
                        {activeDeployment.status}
                    </div>
                </svelte:fragment>

                <svelte:fragment slot="actions">
                    <Button text on:click={() => console.log('open Logs')}>Logs</Button>
                    <Button
                        secondary
                        on:click={() => {
                            showExecute = true;
                            selectedDeployment = activeDeployment;
                        }}>Execute now</Button>
                </svelte:fragment>
            </CardGrid>
        {:else}
            <Empty dashed centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <Button secondary round on:click={() => (showCreate = true)}>
                            <i class="icon-plus" />
                        </Button>
                    </div>
                    <div class="common-section">
                        <p class="u-text-center">
                            Add a new deployment, or activate an existing one to see your function
                            in action.
                        </p>
                        <p class="u-text-center">
                            Learn more about deployments in our <a
                                class="link"
                                href="https://appwrite.io/docs/functions#build"
                                target="_blank"
                                rel="noopener noreferrer">
                                Documentation</a
                            >.
                        </p>
                    </div>
                </div>
            </Empty>
        {/if}

        <div class="common-section">
            <h2 class="heading-level-7">Inactive</h2>
        </div>

        <Table>
            <TableHeader>
                <TableCellHead>Deployment ID</TableCellHead>
                <TableCellHead>Created</TableCellHead>
                <TableCellHead>Status</TableCellHead>
                <TableCellHead>Build time</TableCellHead>
                <TableCellHead>Size</TableCellHead>
                <TableCellHead />
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $deploymentList.deployments as deployment, index}
                    {#if deployment.$id !== $func.deployment}
                        <TableRow>
                            <TableCell title="Deployment ID">
                                <Copy value={deployment.$id}>
                                    <Pill button
                                        ><span class="icon-duplicate" aria-hidden="true" />
                                        <span class="text u-trim">{deployment.$id}</span></Pill>
                                </Copy>
                            </TableCell>
                            <TableCellText title="Created">
                                {toLocaleDateTime(deployment.$createdAt)}
                            </TableCellText>
                            <TableCellText title="Status">{deployment.status}</TableCellText>
                            <TableCellText title="Build Time"
                                >{deployment.entrypoint}</TableCellText>
                            <TableCellText title="Size"
                                >{calculateSize(deployment.size)}</TableCellText>
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
                                            icon="lightning-bolt"
                                            on:click={() => {
                                                selectedDeployment = deployment;
                                                showDropdown = [];
                                                showExecute = true;
                                            }}>Execute now</DropListItem>
                                        <DropListItem
                                            icon="terminal"
                                            on:click={() => {
                                                selectedDeployment = deployment;
                                                showDropdown = [];
                                                console.log('output');
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
        <Empty dashed centered>
            <div class="u-flex u-flex-vertical u-cross-center">
                <div class="common-section">
                    <Button secondary round on:click={() => (showCreate = true)}>
                        <i class="icon-plus" />
                    </Button>
                </div>
                <div class="common-section">
                    <p>Create your first deployment to get started</p>
                </div>
                <div class="common-section">
                    <Button
                        external
                        secondary
                        href="https://appwrite.io/docs/functions#createFunction"
                        >Documentation</Button>
                </div>
            </div>
        </Empty>
    {/if}
    <div class="u-flex u-margin-block-start-32 u-main-space-between">
        <p class="text">Total results: {$deploymentList?.total}</p>
        <Pagination limit={$pageLimit} bind:offset sum={$deploymentList?.total} />
    </div>
</Container>

<Create bind:showCreate />

{#if selectedDeployment}
    <Execute {selectedDeployment} bind:showExecute />
    <Delete {functionId} {selectedDeployment} bind:showDelete />
    <Activate {functionId} {selectedDeployment} bind:showActivate on:activated={handleActivate} />
{/if}
