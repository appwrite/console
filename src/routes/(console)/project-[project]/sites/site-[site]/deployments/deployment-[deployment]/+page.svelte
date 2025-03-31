<script lang="ts">
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models, RealtimeResponseEvent } from '@appwrite.io/console';
    import SiteCard from '../../../(components)/siteCard.svelte';
    import Logs, { badgeTypeDeployment } from '../../../(components)/logs.svelte';
    import Card from '$lib/components/card.svelte';
    import { Button } from '$lib/elements/forms';
    import DeploymentActionMenu from '../../../(components)/deploymentActionMenu.svelte';
    import DeleteDeploymentModal from '../deleteDeploymentModal.svelte';
    import CancelDeploymentModal from '../cancelDeploymentModal.svelte';
    import RedeployModal from '../../../redeployModal.svelte';
    import ActivateDeploymentModal from '../../../activateDeploymentModal.svelte';
    import { protocol } from '$routes/(console)/store';
    import { Accordion } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import LogsTimer from '../../../(components)/logsTimer.svelte';

    let { data } = $props();

    let deployment = $state(data.deployment);
    let showRedeploy = $state(false);
    let showActivate = $state(false);
    let showDelete = $state(false);
    let showCancel = $state(false);

    onMount(async () => {
        if (data.deployment.status === 'ready') {
            return;
        }
        sdk.forConsole.client.subscribe(
            'console',
            async (response: RealtimeResponseEvent<Models.Deployment>) => {
                if (
                    response.events.includes(
                        `sites.${data.deployment.resourceId}.deployments.${data.deployment.$id}.update`
                    )
                ) {
                    deployment = response.payload;
                }
            }
        );
    });
</script>

<Container>
    <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList}>
        <svelte:fragment slot="footer">
            {#if data.deployment?.status === 'ready' && data.proxyRuleList?.total}
                <Button href={`${$protocol}${data.proxyRuleList.rules[0]?.domain}`} external>
                    Visit
                </Button>
            {/if}

            <Button secondary on:click={() => (showRedeploy = true)}>Redeploy</Button>
            <DeploymentActionMenu
                inCard
                deployment={data.deployment}
                selectedDeployment={data.deployment}
                bind:showRedeploy
                bind:showActivate
                bind:showDelete
                bind:showCancel
                activeDeployment={data.site.deploymentId} />
        </svelte:fragment>
    </SiteCard>
    <Card padding="s">
        <Accordion
            title="Deployment logs"
            badge={capitalize(deployment.status)}
            open
            badgeType={badgeTypeDeployment(data.deployment.status)}
            hideDivider>
            <Logs {deployment} hideTitle hideScrollButtons fullHeight />
            <svelte:fragment slot="end">
                <LogsTimer status={deployment.status} {deployment} />
            </svelte:fragment>
        </Accordion>
    </Card>
</Container>

{#if showDelete}
    <DeleteDeploymentModal
        selectedDeployment={deployment}
        bind:showDelete
        activeDeployment={data.site?.deploymentId} />
{/if}

<CancelDeploymentModal selectedDeployment={deployment} bind:showCancel />
<RedeployModal
    selectedDeploymentId={deployment.$id}
    bind:show={showRedeploy}
    redirect
    site={data.site} />
{#if showActivate}
    <ActivateDeploymentModal
        siteId={data.site.$id}
        selectedDeploymentId={deployment.$id}
        bind:show={showActivate} />
{/if}
