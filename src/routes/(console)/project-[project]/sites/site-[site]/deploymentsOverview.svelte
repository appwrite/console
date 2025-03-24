<script lang="ts">
    import { Badge, Empty, Layout, Status, Table, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';
    import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
    import Id from '$lib/components/id.svelte';
    import RedeployModal from '../redeployModal.svelte';
    import { Card } from '$lib/components';
    import ActivateDeploymentModal from '../activateDeploymentModal.svelte';
    import CancelDeploymentModal from './deployments/cancelDeploymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import DeleteDeploymentModal from './deployments/deleteDeploymentModal.svelte';
    import DeploymentActionMenu from '../(components)/deploymentActionMenu.svelte';
    import { deploymentStatusConverter } from '$lib/stores/git';

    export let site: Models.Site;
    export let activeDeployment: Models.Deployment;
    export let deploymentList: Models.DeploymentList = undefined;

    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;
    let showDelete = false;
    let selectedDeployment: Models.Deployment = null;
</script>

<Layout.Stack style="overflow-x: auto;">
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack gap="xs" direction="row" alignItems="center" inline>
            <Typography.Text variant="l-500" color="--fgcolor-neutral-primary">
                Deployments
            </Typography.Text><Badge
                variant="secondary"
                content={deploymentList?.total.toString()}
                size="s" />
        </Layout.Stack>
        <Button
            secondary
            href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments`}>
            View all
        </Button>
    </Layout.Stack>
    {#if deploymentList?.total}
        <Table.Root
            columns={[
                { id: '$id', width: 200 },
                { id: 'status' },
                { id: 'source' },
                { id: 'createdBy' },
                { id: 'actions' }
            ]}
            let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell {root}>Deployment ID</Table.Header.Cell>
                <Table.Header.Cell {root}>Status</Table.Header.Cell>
                <Table.Header.Cell {root}>Source</Table.Header.Cell>
                <Table.Header.Cell {root}>Updated</Table.Header.Cell>
                <Table.Header.Cell {root} />
            </svelte:fragment>
            {#each deploymentList?.deployments as deployment}
                <Table.Row.Link
                    {root}
                    href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments/deployment-${deployment.$id}`}>
                    <Table.Cell {root}>
                        <Id value={deployment.$id}>{deployment.$id}</Id>
                    </Table.Cell>
                    <Table.Cell {root}>
                        {@const status = deployment.status}
                        {#if activeDeployment?.$id === deployment?.$id}
                            <Status status="complete" label="Active" />
                        {:else}
                            <Status
                                status={deploymentStatusConverter(status)}
                                label={capitalize(status)} />
                        {/if}
                    </Table.Cell>

                    <Table.Cell {root}>
                        <DeploymentSource {deployment} />
                    </Table.Cell>
                    <Table.Cell {root}>
                        <DeploymentCreatedBy {deployment} />
                    </Table.Cell>
                    <Table.Cell {root}>
                        <Layout.Stack alignItems="flex-end">
                            <DeploymentActionMenu
                                {deployment}
                                bind:selectedDeployment
                                bind:showRedeploy
                                bind:showActivate
                                bind:showDelete
                                bind:showCancel
                                activeDeployment={site.deploymentId} />
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        </Table.Root>
    {:else}
        <Card padding="l" radius="s">
            <Empty title="No deployments exist" type="secondary">
                <span slot="description">
                    Deployments are created when you deploy your site. You can deploy your site
                    using the CLI, Git, or manually.
                </span>
            </Empty>
        </Card>
    {/if}
</Layout.Stack>

{#if selectedDeployment && showRedeploy}
    <RedeployModal {site} selectedDeploymentId={selectedDeployment.$id} bind:show={showRedeploy} />
{/if}

{#if selectedDeployment && showActivate}
    <ActivateDeploymentModal
        siteId={site.$id}
        selectedDeploymentId={selectedDeployment.$id}
        bind:show={showActivate} />
{/if}

{#if selectedDeployment && showCancel}
    <CancelDeploymentModal {selectedDeployment} bind:showCancel />
{/if}
{#if selectedDeployment && showDelete}
    <DeleteDeploymentModal
        {selectedDeployment}
        bind:showDelete
        activeDeployment={site?.deploymentId} />
{/if}
