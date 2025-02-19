<script lang="ts">
    import {
        ActionMenu,
        Badge,
        Empty,
        Icon,
        Layout,
        Popover,
        Status,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';
    import DeploymentCreatedBy from '../(components)/deploymentCreatedBy.svelte';
    import DeploymentSource from '../(components)/deploymentSource.svelte';
    import Id from '$lib/components/id.svelte';
    import {
        IconDotsHorizontal,
        IconLightningBolt,
        IconRefresh,
        IconXCircle
    } from '@appwrite.io/pink-icons-svelte';
    import RedeployModal from '../redeployModal.svelte';
    import { Card } from '$lib/components';
    import ActivateDeploymentModal from '../activateDeploymentModal.svelte';
    import CancelDeploymentModal from './deployments/cancelDeploymentModal.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { deploymentStatusConverter } from './store';

    export let site: Models.Site;
    export let activeDeployment: Models.Deployment;
    export let deploymentList: Models.DeploymentList = undefined;

    let showActivate = false;
    let showRedeploy = false;
    let showCancel = false;
    let selectedDeployment: Models.Deployment = null;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack gap="xs" direction="row" alignItems="center" inline>
            <Typography.Text variant="l-500" color="--color-fgcolor-neutral-primary">
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
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Deployment ID</Table.Header.Cell>
                <Table.Header.Cell>Status</Table.Header.Cell>
                <Table.Header.Cell>Source</Table.Header.Cell>
                <Table.Header.Cell>Updated</Table.Header.Cell>
                <Table.Header.Cell />
            </svelte:fragment>
            {#each deploymentList?.deployments as deployment}
                <Table.Link
                    href={`${base}/project-${$page.params.project}/sites/site-${$page.params.site}/deployments/deployment-${deployment.$id}`}>
                    <Table.Cell>
                        <Id value={deployment.$id}>{deployment.$id}</Id>
                    </Table.Cell>
                    <Table.Cell>
                        {@const status = deployment.status}
                        {#if activeDeployment?.$id === deployment?.$id}
                            <Status status="complete" label="Active" />
                        {:else}
                            <Status
                                status={deploymentStatusConverter(status)}
                                label={capitalize(status)} />
                        {/if}
                    </Table.Cell>

                    <Table.Cell>
                        <DeploymentSource {deployment} />
                    </Table.Cell>
                    <Table.Cell>
                        <DeploymentCreatedBy {deployment} />
                    </Table.Cell>
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
                                        {#if deployment?.status === 'ready' && deployment?.$id !== site.deploymentId}
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
                                    </ActionMenu.Root>
                                </svelte:fragment>
                            </Popover>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Link>
            {/each}
        </Table.Root>
    {:else}
        <Card isTile padding="l" radius="s">
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
