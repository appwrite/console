<script lang="ts">
    import { Badge, Layout, Status, Table, Typography } from '@appwrite.io/pink-svelte';
    import OpenOnMobileModal from '../(components)/openOnMobileModal.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { type Models } from '@appwrite.io/console';
    import DeploymentCreatedBy from '../(components)/deploymentCreatedBy.svelte';
    import DeploymentSource from '../(components)/deploymentSource.svelte';
    import Id from '$lib/components/id.svelte';

    export let activeDeployment: Models.Deployment;
    export let deploymentList: Models.DeploymentList = undefined;

    let showDomainQR = false;
    let selectedDomainURL: string;
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
                </Table.Link>
            {/each}
        </Table.Root>
    {/if}
</Layout.Stack>

{#if showDomainQR && selectedDomainURL}
    <OpenOnMobileModal bind:show={showDomainQR} siteURL={selectedDomainURL} />
{/if}
