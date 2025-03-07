<script lang="ts">
    import { DropListItem, DropListLink, Id } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import type { Column } from '$lib/helpers/types';
    import { Pill } from '$lib/elements';
    import { calculateTime } from '$lib/helpers/timeConversion';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { func } from './store';
    import { page } from '$app/stores';
    import Activate from './activate.svelte';
    import RedeployModal from './redeployModal.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Cancel from './(modals)/cancel.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { base } from '$app/paths';
    import { ActionMenu, Icon, Popover, Table } from '@appwrite.io/pink-svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { IconDotsHorizontal } from '@appwrite.io/pink-icons-svelte';
    import { Button } from '$lib/elements/forms';
    import { DeploymentCreatedBy, DeploymentSource } from '$lib/components/git';
    import Delete from './(modals)/delete.svelte';

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
                <Table.Header.Cell width={column.width.toString()}>
                    {column.title}
                </Table.Header.Cell>
            {/if}
        {/each}
        <Table.Header.Cell width="40" />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment, index (deployment.$id)}
        <Table.Row>
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
                        </Table.Cell>
                    {:else if column.id === 'type'}
                        <Table.Cell>
                            <DeploymentSource {deployment} />
                        </Table.Cell>
                    {:else if column.id === '$updatedAt'}
                        <Table.Cell>
                            <DeploymentCreatedBy {deployment} />
                        </Table.Cell>
                    {:else if column.id === 'buildTime'}
                        <Table.Cell>
                            {#if ['processing', 'building'].includes(deployment.status)}
                                <span use:timer={{ start: deployment.$createdAt }} />
                            {:else}
                                {calculateTime(deployment.buildTime)}
                            {/if}
                        </Table.Cell>
                    {:else if column.id === 'size'}
                        <Table.Cell>
                            {calculateSize(deployment.size)}
                        </Table.Cell>
                    {:else if column.id === 'buildSize'}
                        <Table.Cell>
                            {calculateSize(deployment.buildSize)}
                        </Table.Cell>
                    {/if}
                {/if}
            {/each}
            <Table.Cell>
                <Popover let:toggle placement="bottom-start">
                    <Button icon text on:click={toggle}>
                        <Icon icon={IconDotsHorizontal} size="s" />
                    </Button>
                    <svelte:fragment slot="tooltip">
                        <ActionMenu.Root>
                            <DropListItem
                                icon="refresh"
                                on:click={() => {
                                    selectedDeployment = deployment;
                                    showRedeploy = true;
                                    showDropdown = [];
                                    trackEvent(Click.FunctionsRedeployClick);
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
                                        trackEvent(Click.FunctionsDeploymentDeleteClick);
                                    }}>
                                    Delete
                                </DropListItem>
                            {/if}
                        </ActionMenu.Root>
                    </svelte:fragment>
                </Popover>
            </Table.Cell>
        </Table.Row>
    {/each}
</Table.Root>

{#if selectedDeployment}
    <Delete {selectedDeployment} bind:showDelete />
    <Activate {selectedDeployment} bind:showActivate on:activated={handleActivate} />
    <Cancel {selectedDeployment} bind:showCancel />
    <RedeployModal {selectedDeployment} bind:show={showRedeploy} />
{/if}
