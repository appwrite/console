<script lang="ts">
    import { Id } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { func } from './store';
    import { page } from '$app/state';
    import Activate from './(modals)/activateModal.svelte';
    import RedeployModal from './(modals)/redeployModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Cancel from './(modals)/cancelDeploymentModal.svelte';
    import { base } from '$app/paths';
    import { ActionMenu, Icon, Status, Table } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        IconDotsHorizontal,
        IconLightningBolt,
        IconRefresh,
        IconTrash,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { DeploymentCreatedBy, DeploymentSource } from '$lib/components/git';
    import Delete from './(modals)/deleteModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { deploymentStatusConverter } from '$lib/stores/git';
    import DownloadActionMenuItem from './(components)/downloadActionMenuItem.svelte';
    import { Menu } from '$lib/components/menu';

    export let columns: Column[];
    export let data: PageData;

    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;

    let selectedDeployment: Models.Deployment = null;

    function handleActivate() {
        invalidate(Dependencies.DEPLOYMENTS);
    }
</script>

<Table.Root columns={[...columns, { id: 'actions', width: 40 }]} let:root>
    <svelte:fragment slot="header" let:root>
        {#each columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment (deployment.$id)}
        <Table.Row.Link
            {root}
            href={`${base}/project-${page.params.project}/functions/function-${page.params.function}/deployment-${deployment.$id}`}>
            {#each columns as column}
                <Table.Cell column={column.id} {root}>
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Id value={deployment.$id}>{deployment.$id}</Id>
                        {/key}
                    {:else if column.id === 'status'}
                        {@const status = deployment.status}

                        {#if data?.activeDeployment?.$id === deployment?.$id}
                            <Status status="complete" label="Active" />
                        {:else}
                            <Status
                                status={deploymentStatusConverter(status)}
                                label={capitalize(status)} />
                        {/if}
                    {:else if column.id === 'type'}
                        <DeploymentSource {deployment} />
                    {:else if column.id === '$updatedAt'}
                        <DeploymentCreatedBy {deployment} />
                    {:else if column.id === 'buildDuration'}
                        {#if ['waiting'].includes(deployment.status)}
                            -
                        {:else if ['processing', 'building'].includes(deployment.status)}
                            <span use:timer={{ start: deployment.$createdAt }}></span>
                        {:else}
                            {formatTimeDetailed(deployment.buildDuration)}
                        {/if}
                    {:else if column.id === 'totalSize'}
                        {calculateSize(deployment.totalSize)}
                    {:else if column.id === 'sourceSize'}
                        {calculateSize(deployment.sourceSize)}
                    {:else if column.id === 'buildSize'}
                        {calculateSize(deployment.buildSize)}
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
                <Menu>
                    <Button text icon size="s">
                        <Icon size="s" icon={IconDotsHorizontal} />
                    </Button>

                    <svelte:fragment slot="menu" let:toggle>
                        <ActionMenu.Root>
                            <ActionMenu.Item.Button
                                trailingIcon={IconRefresh}
                                on:click={() => {
                                    selectedDeployment = deployment;
                                    showRedeploy = true;
                                    toggle();
                                    trackEvent(Click.FunctionsRedeployClick);
                                }}>
                                Redeploy
                            </ActionMenu.Item.Button>
                            {#if deployment.status === 'ready' && deployment.$id !== $func.deploymentId}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconLightningBolt}
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        showActivate = true;
                                        toggle();
                                    }}>
                                    Activate
                                </ActionMenu.Item.Button>
                            {/if}

                            <DownloadActionMenuItem {deployment} {toggle} />

                            {#if deployment.status === 'processing' || deployment.status === 'building' || deployment.status === 'waiting'}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconXCircle}
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        toggle();

                                        showCancel = true;
                                        trackEvent(Click.FunctionsDeploymentCancelClick);
                                    }}>
                                    Cancel
                                </ActionMenu.Item.Button>
                            {/if}
                            {#if deployment.status !== 'building' && deployment.status !== 'processing' && deployment.status !== 'waiting'}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconTrash}
                                    status="danger"
                                    on:click={() => {
                                        selectedDeployment = deployment;
                                        toggle();

                                        showDelete = true;
                                        trackEvent(Click.FunctionsDeploymentDeleteClick);
                                    }}>
                                    Delete
                                </ActionMenu.Item.Button>
                            {/if}
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Menu>
            </Table.Cell>
        </Table.Row.Link>
    {/each}
</Table.Root>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
