<script lang="ts">
    import { Confirm, Id } from '$lib/components';
    import type { PageData } from './$types';
    import { type Models } from '@appwrite.io/console';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
    import { timer } from '$lib/actions/timer';
    import { calculateSize } from '$lib/helpers/sizeConvertion';
    import { page } from '$app/state';
    import Delete from './deleteDeploymentModal.svelte';
    import RedeployModal from '../../redeployModal.svelte';
    import Cancel from './cancelDeploymentModal.svelte';
    import { base } from '$app/paths';
    import { Badge, FloatingActionBar, Layout, Status, Table } from '@appwrite.io/pink-svelte';
    import { columns } from './store';
    import ActivateDeploymentModal from '../../activateDeploymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import DeploymentActionMenu from '../../(components)/deploymentActionMenu.svelte';
    import { deploymentStatusConverter } from '$lib/stores/git';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { site } from '$routes/(console)/project-[region]-[project]/sites/site-[site]/store';

    export let data: PageData;

    let showDelete = false;
    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;

    let selectedRows = [];
    let showBatchDeletion = false;
    let selectedDeployment: Models.Deployment = null;

    async function deleteDeployments() {
        showBatchDeletion = false;

        const promises = selectedRows.map((deploymentId) =>
            sdk
                .forProject(page.params.region, page.params.project)
                .sites.deleteDeployment(page.params.site, deploymentId)
        );
        try {
            await Promise.all(promises);
            trackEvent(Submit.DeploymentDelete);
            addNotification({
                type: 'success',
                message: `${selectedRows.length} deployment${selectedRows.length > 1 ? 's' : ''} deleted`
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DeploymentDelete);
        } finally {
            selectedRows = [];
            invalidate(Dependencies.DEPLOYMENTS);
        }
    }
</script>

<Table.Root
    let:root
    allowSelection
    bind:selectedRows
    columns={[...$columns, { id: 'actions', width: 40 }]}>
    <svelte:fragment slot="header" let:root>
        {#each $columns as { id, title }}
            <Table.Header.Cell column={id} {root}>
                {title}
            </Table.Header.Cell>
        {/each}
        <Table.Header.Cell column="actions" {root} />
    </svelte:fragment>
    {#each data.deploymentList.deployments as deployment (deployment.$id)}
        <Table.Row.Link
            {root}
            id={deployment.$id}
            href={`${base}/project-${page.params.region}-${page.params.project}/sites/site-${page.params.site}/deployments/deployment-${deployment.$id}`}>
            {#each $columns as column}
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
                        {calculateSize(deployment?.totalSize ?? 0)}
                    {:else if column.id === 'sourceSize'}
                        {calculateSize(deployment.sourceSize)}
                    {:else if column.id === 'buildSize'}
                        {calculateSize(deployment.buildSize)}
                    {/if}
                </Table.Cell>
            {/each}
            <Table.Cell column="actions" {root}>
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
        </Table.Row.Link>
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

{#if selectedRows.length > 0}
    <FloatingActionBar>
        <svelte:fragment slot="start">
            <Badge content={selectedRows.length.toString()} />
            <span>
                {selectedRows.length > 1 ? 'deployments' : 'deployment'}
                selected
            </span>
        </svelte:fragment>
        <svelte:fragment slot="end">
            <Button text on:click={() => (selectedRows = [])}>Cancel</Button>
            <Button secondary on:click={() => (showBatchDeletion = true)}>Delete</Button>
        </svelte:fragment>
    </FloatingActionBar>
{/if}

<Confirm
    title="Delete deployments"
    confirmDeletion
    onSubmit={deleteDeployments}
    bind:open={showBatchDeletion}>
    <p>
        Are you sure you want to delete <strong>{selectedRows.length}</strong>
        {selectedRows.length > 1 ? 'deployments' : 'deployment'} from your site -
        <strong>{$site.name}</strong>?
    </p>

    <p class="u-bold">This action is irreversible.</p>
</Confirm>
