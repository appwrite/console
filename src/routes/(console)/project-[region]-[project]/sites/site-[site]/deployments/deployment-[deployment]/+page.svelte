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
    import { Accordion } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import LogsTimer from '../../../(components)/logsTimer.svelte';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';

    let { data } = $props();

    let deployment = $derived(data.deployment);

    let showRedeploy = $state(false);
    let showActivate = $state(false);
    let showDelete = $state(false);
    let showCancel = $state(false);

    onMount(async () => {
        sdk.forConsole.client.subscribe(
            'console',
            async (response: RealtimeResponseEvent<Models.Deployment>) => {
                if (
                    response.events.includes(
                        `sites.${page.params.site}.deployments.${page.params.deployment}.update`
                    )
                ) {
                    invalidate(Dependencies.DEPLOYMENTS);
                }
            }
        );
    });
</script>

<Container>
    <SiteCard {deployment} proxyRuleList={data.proxyRuleList}>
        <svelte:fragment slot="footer">
            {#if deployment?.status === 'ready' && data.proxyRuleList?.total}
                <Button
                    href={`${$regionalProtocol}${data.proxyRuleList.rules[0]?.domain}`}
                    external>
                    Visit
                </Button>
            {/if}

            <Button secondary on:click={() => (showRedeploy = true)}>Redeploy</Button>
            <DeploymentActionMenu
                inCard
                {deployment}
                selectedDeployment={deployment}
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
            badgeType={badgeTypeDeployment(deployment.status)}
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
