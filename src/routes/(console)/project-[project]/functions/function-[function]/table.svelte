<script lang="ts">
    import { Id } from '$lib/components';
    import type { PageData } from './$types';
    import { DeploymentDownloadType, type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { func } from './store';
    import { page } from '$app/stores';
    import Activate from './(modals)/activateModal.svelte';
    import RedeployModal from './(modals)/redeployModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Cancel from './(modals)/cancel.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { ActionMenu, Icon, Layout, Popover, Status, Table } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import {
        IconDotsHorizontal,
        IconDownload,
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

    //TODO: implement output download
    function getDownload(deploymentId: string) {
        return (
            sdk.forProject.functions.getDeploymentDownload($func.$id, deploymentId).toString() +
                '&mode=admin',
            DeploymentDownloadType.Source
        );
    }
</script>

<Table.Root>
    <svelte:fragment slot="header">
        {#each columns as column}
            {#if column.show}
                <Table.Header.Cell width={column.width.toString()}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment, index (deployment.$id)}
        <Table.Link
            href={`${base}/project-${$page.params.project}/functions/function-${$page.params.function}/deployment-${deployment.$id}`}>
            {#each columns as column}
                {#if column.show}
                    {#if column.id === '$id'}
                        {#key column.id}
                            <Table.Cell>
                                <Id value={deployment.$id}>{deployment.$id}</Id>
                            </Table.Cell>
                        {/key}
                    {:else if column.id === 'status'}
                        <Table.Cell>
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
                        <Table.Cell>
                            <DeploymentSource {deployment} />
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell>
                            <DeploymentCreatedBy {deployment} />
                        </Table.Cell>
                    {:else if column.id === 'buildDuration'}
                        <Table.Cell>
                            {#if ['processing', 'building'].includes(deployment.status)}
                                <span use:timer={{ start: deployment.$createdAt }} />
                            {:else}
                                {formatTimeDetailed(deployment.buildDuration)}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'sourceSize'}
                        <Table.Cell>
                            {calculateSize(deployment.sourceSize)}
                        </Table.Cell>
                    {:else if column.id === 'buildSize'}
                        <Table.Cell>
                            {calculateSize(deployment.buildSize)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <Layout.Stack justifyContent="flex-end">
                    <Popover let:toggle placement="bottom-start" padding="none">
                        <!-- TODO: check why button style is broken -->
                        <Button text icon on:click={toggle}>
                            <Icon icon={IconDotsHorizontal} size="s" />
                        </Button>
                        <svelte:fragment slot="tooltip" let:toggle>
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button
                                    trailingIcon={IconRefresh}
                                    on:click={(e) => {
                                        selectedDeployment = deployment;
                                        showRedeploy = true;
                                        toggle(e);
                                        trackEvent(Click.FunctionsRedeployClick);
                                    }}>
                                    Redeploy
                                </ActionMenu.Item.Button>
                                {#if deployment.status === 'ready' && deployment.$id !== $func.deployment}
                                    <ActionMenu.Item.Button
                                        trailingIcon={IconLightningBolt}
                                        on:click={(e) => {
                                            selectedDeployment = deployment;
                                            showActivate = true;
                                            toggle(e);
                                        }}>
                                        Activate
                                    </ActionMenu.Item.Button>
                                {/if}

                                <ActionMenu.Item.Anchor
                                    trailingIcon={IconDownload}
                                    href={getDownload(deployment.$id)}
                                    on:click={() => (showDropdown[index] = false)}>
                                    Download
                                </ActionMenu.Item.Anchor>
                                {#if deployment.status === 'processing' || deployment.status === 'building' || deployment.status === 'waiting'}
                                    <ActionMenu.Item.Button
                                        trailingIcon={IconXCircle}
                                        on:click={(e) => {
                                            selectedDeployment = deployment;
                                            toggle(e);

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
                                        on:click={(e) => {
                                            selectedDeployment = deployment;
                                            toggle(e);

                                            showDelete = true;
                                            trackEvent(Click.FunctionsDeploymentDeleteClick);
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
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
