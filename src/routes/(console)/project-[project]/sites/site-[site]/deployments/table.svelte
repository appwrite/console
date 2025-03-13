<script lang="ts">
    import { Id } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { page } from '$app/stores';
    import Delete from './deleteDeploymentModal.svelte';
    import RedeployModal from '../../redeployModal.svelte';
    import Cancel from './cancelDeploymentModal.svelte';
    import { base } from '$app/paths';
    import { Layout, Status, Table } from '@appwrite.io/pink-svelte';
    import { columns } from './store';
    import ActivateDeploymentModal from '../../activateDeploymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import DeploymentActionMenu from '../../(components)/deploymentActionMenu.svelte';
    import { deploymentStatusConverter } from '$lib/stores/git';

    export let data: PageData;

    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;

    let selectedDeployment: Models.Deployment = null;
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each $columns as column}
            {#if column.show}
                <Table.Header.Cell width={column?.width?.toString() ?? ''}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment}
        <Table.Link
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments/deployment-${deployment.$id}`}>
            {#each $columns as column}
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
                                <Status status="complete" label="Active" />
                            {:else}
                                <Status
                                    status={deploymentStatusConverter(status)}
                                    label={capitalize(status)} />
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'type'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <DeploymentSource {deployment} />
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <DeploymentCreatedBy {deployment} />
                        </Table.Cell>
                    {:else if column.id === 'buildDuration'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {#if ['waiting'].includes(deployment.status)}
                                -
                            {:else if ['processing', 'building'].includes(deployment.status)}
                                <span use:timer={{ start: deployment.$createdAt }} />
                            {:else}
                                {formatTimeDetailed(deployment.buildDuration)}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'sourceSize'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {calculateSize(deployment.sourceSize)}
                        </Table.Cell>
                    {:else if column.id === 'buildSize'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            {calculateSize(deployment.buildSize)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <Layout.Stack alignItems="flex-end">
                    <DeploymentActionMenu
                        {deployment}
                        bind:selectedDeployment
                        bind:showRedeploy
                        bind:showActivate
                        bind:showDelete
                        bind:showCancel
                        activeDeployment={data.site.deploymentId} />
                </Layout.Stack>
            </Table.Cell>
        </Table.Link>
    {/each}
</Table.Root>

{#if selectedDeployment}
    <Delete {selectedDeployment} activeDeployment={data.site.deploymentId} bind:showDelete />

    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal
        selectedDeploymentId={selectedDeployment.$id}
        bind:show={showRedeploy}
        site={data.site} />
{/if}
{#if selectedDeployment && showActivate}
    <ActivateDeploymentModal
        siteId={data.site.$id}
        selectedDeploymentId={selectedDeployment.$id}
        bind:show={showActivate} />
{/if}
