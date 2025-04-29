<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Card, LabelCard, Modal, Paginator, Status } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Link } from '$lib/elements';
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { type Models } from '@appwrite.io/console';
    import DeploymentDomains from '$lib/components/git/deploymentDomains.svelte';
    import { Badge, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { timeFromNow, toLocaleDateTime } from '$lib/helpers/date';
    import { capitalize } from '$lib/helpers/string';
    import { calculateSize } from '$lib/helpers/sizeConvertion';

    export let show = false;
    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList;
    export let prodReadyDeployments: Models.DeploymentList;
    export let selectedDeployment: Models.Deployment = undefined;
    let selectedDeploymentId: string;
    let confirm = false;

    async function handleSubmit() {
        try {
            await sdk.forProject.sites.updateSiteDeployment(
                selectedDeployment.resourceId,
                selectedDeployment.$id
            );
            await invalidate(Dependencies.SITE);
            show = false;
            addNotification({
                type: 'success',
                message: `Deployment has been activated`
            });
            trackEvent(Submit.DeploymentCancel);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DeploymentCancel);
        }
    }

    $: if (selectedDeploymentId) {
        selectedDeployment = prodReadyDeployments.deployments.find(
            (deployment) => deployment.$id === selectedDeploymentId
        );
    }
</script>

<Modal title="Instant rollback" bind:show onSubmit={handleSubmit}>
    <svelte:fragment slot="description">
        Rollback is only available for deployments that are <b>ready and previously active</b>. <Link
            href="#/">Learn more</Link
        >.
    </svelte:fragment>
    <Layout.Stack gap="xl">
        <Layout.Stack gap="s">
            <Layout.Stack direction="row" alignItems="center" gap="s">
                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                    Rollback
                </Typography.Text>
                <DeploymentDomains domains={proxyRuleList} />
            </Layout.Stack>
            <Card padding="xs" radius="s" variant="secondary">
                <Layout.Stack gap="xxs">
                    <Layout.Stack
                        direction="row"
                        alignItems="center"
                        gap="s"
                        justifyContent="space-between">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                            {toLocaleDateTime(deployment.$createdAt)}
                        </Typography.Text>
                        <Badge variant="secondary" content="Current" size="xs" />
                    </Layout.Stack>

                    <Layout.Stack direction="row" alignItems="center" gap="s">
                        <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                            <Status status="ready">Active</Status>
                        </Typography.Caption>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2"
                            height="3"
                            viewBox="0 0 2 3"
                            fill="none">
                            <circle cx="1" cy="1.5" r="1" fill="currentColor" />
                        </svg>
                        <Typography.Caption variant="400" color="--fgcolor-neutral-secondary">
                            {calculateSize(deployment.buildSize)}
                        </Typography.Caption>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="2"
                            height="3"
                            viewBox="0 0 2 3"
                            fill="none">
                            <circle cx="1" cy="1.5" r="1" fill="currentColor" />
                        </svg>
                        <Typography.Caption
                            variant="400"
                            color="--fgcolor-neutral-secondary"
                            truncate>
                            {capitalize(timeFromNow(deployment.$createdAt))}
                            {#if deployment?.providerCommitAuthorUrl && deployment?.providerCommitAuthor}
                                by <Link size="s" href={deployment.providerCommitAuthorUrl} external
                                    >{deployment.providerCommitAuthor}</Link>
                            {/if}
                        </Typography.Caption>
                    </Layout.Stack>
                </Layout.Stack>
            </Card>
        </Layout.Stack>
        <Layout.Stack gap="s">
            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                To the following deployment:
            </Typography.Text>
            {#if prodReadyDeployments?.deployments?.length}
                {@const items = prodReadyDeployments.deployments.filter(
                    (prodDeployment) => prodDeployment.$id !== deployment.$id
                )}
                <Paginator {items} hideFooter={items?.length <= 6} limit={6}>
                    {#snippet children(paginatedItems: typeof items)}
                        {#each paginatedItems as prodDeployment}
                            <LabelCard
                                padding="xs"
                                radius="s"
                                title={toLocaleDateTime(prodDeployment.$createdAt)}
                                bind:group={selectedDeploymentId}
                                value={prodDeployment.$id}>
                                <Layout.Stack gap="s" direction="row" alignItems="center">
                                    <Typography.Caption
                                        variant="400"
                                        color="--fgcolor-neutral-secondary">
                                        {calculateSize(deployment.buildSize)}
                                    </Typography.Caption>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="2"
                                        height="3"
                                        viewBox="0 0 2 3"
                                        fill="none">
                                        <circle cx="1" cy="1.5" r="1" fill="currentColor" />
                                    </svg>
                                    <Typography.Caption
                                        variant="400"
                                        color="--fgcolor-neutral-secondary"
                                        truncate>
                                        {capitalize(timeFromNow(prodDeployment.$createdAt))}
                                        {#if prodDeployment?.providerCommitAuthorUrl && prodDeployment?.providerCommitAuthor}
                                            by <Link
                                                size="s"
                                                href={prodDeployment.providerCommitAuthorUrl}
                                                external
                                                >{prodDeployment.providerCommitAuthor}</Link>
                                        {/if}
                                    </Typography.Caption>
                                </Layout.Stack>
                            </LabelCard>
                        {/each}
                    {/snippet}
                </Paginator>
            {/if}
        </Layout.Stack>
        {#if selectedDeployment?.$id}
            <InputCheckbox
                id="rollback"
                label={`Rollback to ${toLocaleDateTime(selectedDeployment.$createdAt)}, making it the active deployment`}
                bind:checked={confirm} />
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button text on:click={() => (show = false)}>Cancel</Button>
        <Button submit disabled={!selectedDeployment?.$id || !confirm}>Rollback</Button>
    </svelte:fragment>
</Modal>
