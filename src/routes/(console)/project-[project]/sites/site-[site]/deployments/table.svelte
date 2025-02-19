<script lang="ts">
    import { Id, Trim } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import DeploymentSource from '../../(components)/deploymentSource.svelte';
    import DeploymentCreatedBy from '../../(components)/deploymentCreatedBy.svelte';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { page } from '$app/stores';
    import Delete from './deleteDeploymentModal.svelte';
    import RedeployModal from '../../redeployModal.svelte';
    import Cancel from './cancelDeploymentModal.svelte';
    import { base } from '$app/paths';
    import { ActionMenu, Icon, Layout, Popover, Status, Table } from '@appwrite.io/pink-svelte';
    import {
        IconDotsHorizontal,
        IconLightningBolt,
        IconRefresh,
        IconTerminal,
        IconTrash,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { columns } from './store';
    import ActivateDeploymentModal from '../../activateDeploymentModal.svelte';
    import { deploymentStatusConverter } from '../store';
    import { capitalize } from '$lib/helpers/string';
    import { Button } from '$lib/elements/forms';

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
                    {:else if column.id === 'domains'}
                        <Table.Cell width={column?.width?.toString() ?? ''}>
                            <div style="max-width: 150px">
                                <Trim>
                                    {deployment.domain}
                                </Trim>
                            </div>
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
                                {formatTimeDetailed(deployment.buildTime)}
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
                <Layout.Stack alignItems="flex-end">
                    <Popover placement="bottom-end" let:toggle>
                        <Button
                            text
                            icon
                            size="s"
                            on:click={(e) => {
                                e.preventDefault();
                                toggle(e);
                            }}>
                            <Icon size="s" icon={IconDotsHorizontal} />
                        </Button>
                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button
                                    leadingIcon={IconRefresh}
                                    on:click={(e) => {
                                        e.preventDefault();
                                        selectedDeployment = deployment;
                                        showRedeploy = true;
                                        toggle(e);
                                    }}>
                                    Redeploy
                                </ActionMenu.Item.Button>
                                <ActionMenu.Item.Anchor
                                    leadingIcon={IconTerminal}
                                    href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments/deployment-${deployment.$id}`}
                                    on:click={(e) => {
                                        e.preventDefault();
                                        toggle(e);
                                    }}>
                                    View details
                                </ActionMenu.Item.Anchor>
                                {#if deployment?.status === 'ready' && deployment?.$id !== data.site.deploymentId}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconLightningBolt}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedDeployment = deployment;
                                            showActivate = true;
                                            toggle(e);
                                        }}>
                                        Activate
                                    </ActionMenu.Item.Button>
                                {/if}

                                {#if deployment?.status === 'processing' || deployment?.status === 'building' || deployment.status === 'waiting'}
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconXCircle}
                                        status="danger"
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedDeployment = deployment;
                                            showCancel = true;
                                            toggle(e);
                                        }}>
                                        Cancel
                                    </ActionMenu.Item.Button>
                                {/if}
                                {#if deployment.status !== 'building' && deployment.status !== 'processing' && deployment?.status !== 'waiting'}
                                    <ActionMenu.Item.Button
                                        status="danger"
                                        leadingIcon={IconTrash}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedDeployment = deployment;
                                            showDelete = true;
                                            toggle(e);
                                        }}>
                                        Delete
                                    </ActionMenu.Item.Button>
                                {/if}
                            </ActionMenu.Root>
                        </svelte:fragment>
                    </Popover>
                </Layout.Stack>
            </Table.Cell>
        </Table.Link>
    {/each}
</Table.Root>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />

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
