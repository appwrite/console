<script lang="ts">
    import {
        ActionMenu,
        Badge,
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
    import { IconDotsHorizontal, IconGlobeAlt, IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import RedeployModal from '../redeployModal.svelte';
    import PromoteModal from '../promoteModal.svelte';

    export let site: Models.Site;
    export let activeDeployment: Models.Deployment;
    export let deploymentList: Models.DeploymentList = undefined;

    let showPromote = false;
    let showRedeploy = false;
    let selectedDeployment: Models.Deployment = null;

    $: console.log(deploymentList);
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack gap="xs" direction="row" alignItems="center" inline>
            <Typography.Text variant="l-500">Deployments</Typography.Text><Badge
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

                    <Table.Cell>
                        <DeploymentSource {deployment} />
                    </Table.Cell>
                    <Table.Cell>
                        <DeploymentCreatedBy {deployment} />
                    </Table.Cell>
                    <Table.Cell>
                        <Popover placement="bottom-end" let:toggle>
                            <Button
                                text
                                icon
                                size="s"
                                on:click={(e) => {
                                    e.preventDefault();
                                    toggle(e);
                                }}>
                                <Icon size="s" icon={IconDotsHorizontal} /></Button>
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
                                    <ActionMenu.Item.Button
                                        leadingIcon={IconGlobeAlt}
                                        on:click={(e) => {
                                            e.preventDefault();
                                            selectedDeployment = deployment;
                                            showPromote = true;
                                            toggle(e);
                                        }}>
                                        Promote
                                    </ActionMenu.Item.Button>
                                </ActionMenu.Root>
                            </svelte:fragment>
                        </Popover>
                    </Table.Cell>
                </Table.Link>
            {/each}
        </Table.Root>
    {/if}
</Layout.Stack>

{#if selectedDeployment && showRedeploy}
    <RedeployModal {site} selectedDeploymentId={selectedDeployment.$id} bind:show={showRedeploy} />
{/if}

{#if selectedDeployment && showPromote}
    <PromoteModal
        siteId={site.$id}
        selectedDeploymentId={selectedDeployment.$id}
        bind:show={showPromote} />
{/if}
