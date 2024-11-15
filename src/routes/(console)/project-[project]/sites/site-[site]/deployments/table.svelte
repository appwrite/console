<script lang="ts">
    import { DropList, DropListItem, DropListLink, Id } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { Pill } from '$lib/elements';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { func, proxyRuleList } from './store';
    import { page } from '$app/stores';
    import Delete from './delete.svelte';
    import RedeployModal from './redeployModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Cancel from './cancel.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { Status, Table } from '@appwrite.io/pink-svelte';

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
            sdk.forProject.functions.getDeploymentDownload($func.$id, deploymentId).toString() +
            '&mode=admin'
        );
    }
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each columns as column}
            {#if column.show}
                <Table.Header.Cell width={column?.width?.toString() ?? ''}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment, index (deployment.$id)}
        <Table.Link
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments/deployment-${deployment.$id}`}>
            {#each columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell width={column?.width?.toString() ?? ''}>
                                <Id value={deployment.$id}>{deployment.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'status'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {@const status = deployment.status}
                            {#if data?.activeDeployment?.$id === deployment?.$id}
                                <Status status="complete" label="active" />
                            {:else}
                                <Status
                                    status={status === 'failed'
                                        ? status
                                        : status === 'building'
                                          ? 'pending'
                                          : 'ready'}
                                    label={status} />
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'domains'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {JSON.stringify($proxyRuleList)}
                        </Table.Cell>
                    {:else if column.id === 'type'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <DeploymentSource {deployment} />
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <DeploymentCreatedBy {deployment} />
                        </Table.Cell>
                    {:else if column.id === 'buildTime'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {#if ['processing', 'building'].includes(deployment.status)}
                                <span use:timer={{ start: deployment.$createdAt }} />
                            {:else}
                                {calculateTime(deployment.buildTime)}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'size'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {calculateSize(deployment.size)}
                        </Table.Cell>
                    {:else if column.id === 'buildSize'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {calculateSize(deployment.buildSize)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
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
                            href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${deployment.$id}`}>
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
            </Table.Cell>
        </Table.Link>
    {/each}
</Table.Root>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <!-- <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} /> -->
    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
