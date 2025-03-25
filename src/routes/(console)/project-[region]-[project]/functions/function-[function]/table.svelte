<script lang="ts">
    import { DropList, DropListItem, DropListLink, Id } from '$lib/components';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { Pill } from '$lib/elements';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentBy from './deploymentBy.svelte';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { func } from './store';
    import { page } from '$app/stores';
    import Delete from './delete.svelte';
    import Activate from './activate.svelte';
    import RedeployModal from './redeployModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Cancel from './cancel.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';

    export let columns: Column[];
    export let data: PageData;

    let showDropdown = [];
    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;

    let selectedDeployment: Models.Deployment = null;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }

    function getDownload(deploymentId: string) {
        return (
            sdk
                .forProject($page.params.region, $page.params.project)
                .functions.getDeploymentDownload($func.$id, deploymentId)
                .toString() + '&mode=admin'
        );
    }
</script>

<TableScroll>
    <TableHeader>
        {#each columns as column}
            {#if column.show}
                <TableCellHead width={column.width}>{column.title}</TableCellHead>
            {/if}
        {/each}
        <TableCellHead width={40} />
    </TableHeader>
    <TableBody>
        {#each data.deploymentList.deployments as deployment, index (deployment.$id)}
            <TableRow>
                {#each columns as column}
                    {#if column.show}
                        {#if column.id === '$id'}
                            {#key column.id}
                                <TableCell width={column.width} title="Deployment ID">
                                    <Id value={deployment.$id}>{deployment.$id}</Id>
                                </TableCell>
                            {/key}
                        {:else if column.id === 'status'}
                            <TableCell width={column.width} title={column.title}>
                                {@const status = deployment.status}
                                {#if data?.activeDeployment?.$id === deployment?.$id}
                                    <Pill success>
                                        <span class="icon-lightning-bolt" aria-hidden="true" />
                                        <span class="text u-trim">active</span>
                                    </Pill>
                                {:else}
                                    <Pill
                                        danger={status === 'failed'}
                                        warning={status === 'building'}
                                        info={status === 'ready'}>
                                        {status}
                                    </Pill>
                                {/if}
                            </TableCell>
                        {:else if column.id === 'type'}
                            <TableCell width={column.width} title={column.title}>
                                <DeploymentSource {deployment} />
                            </TableCell>
                        {:else if column.id === '$createdAt'}
                            <TableCellText width={column.width} title={column.title}>
                                <DeploymentBy {deployment} type="create" />
                            </TableCellText>
                        {:else if column.id === '$updatedAt'}
                            <TableCellText width={column.width} title={column.title}>
                                <DeploymentBy {deployment} type="update" />
                            </TableCellText>
                        {:else if column.id === 'buildTime'}
                            <TableCellText width={column.width} title={column.title}>
                                {#if ['processing', 'building'].includes(deployment.status)}
                                    <span use:timer={{ start: deployment.$createdAt }} />
                                {:else}
                                    {calculateTime(deployment.buildTime)}
                                {/if}
                            </TableCellText>
                        {:else if column.id === 'size'}
                            <TableCellText width={column.width} title={column.title}>
                                {calculateSize(deployment.size)}
                            </TableCellText>
                        {:else if column.id === 'buildSize'}
                            <TableCellText width={column.width} title={column.title}>
                                {calculateSize(deployment.buildSize)}
                            </TableCellText>
                        {/if}
                    {/if}
                {/each}
                <TableCell width={40} showOverflow>
                    <DropList bind:show={showDropdown[index]} placement="bottom-start" noArrow>
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
                                href={`${base}/project-${$page.params.region}-${$page.params.project}/functions/function-${$page.params.function}/deployment-${deployment.$id}`}>
                                Logs
                            </DropListLink>
                            <DropListLink
                                icon="download"
                                href={getDownload(deployment.$id)}
                                on:click={() => (showDropdown[index] = false)}>
                                Download
                            </DropListLink>
                            {#if deployment.status === 'processing' || deployment.status === 'building' || deployment.status === 'waiting'}
                                <DropListItem
                                    icon="x-circle"
                                    event="deployment_cancel"
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        showDropdown = [];
                                        showCancel = true;
                                    }}>
                                    Cancel
                                </DropListItem>
                            {/if}
                            {#if deployment.status !== 'building' && deployment.status !== 'processing' && deployment.status !== 'waiting'}
                                <DropListItem
                                    icon="trash"
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        showDropdown = [];
                                        showDelete = true;
                                    }}>
                                    Delete
                                </DropListItem>
                            {/if}
                        </svelte:fragment>
                    </DropList>
                </TableCell>
            </TableRow>
        {/each}
    </TableBody>
</TableScroll>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
