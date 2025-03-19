<script lang="ts">
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { deployment } from './store';
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

    export let data;


    onMount(() => {
        if ($deployment.status === 'ready') {
            return;
        }
        return sdk.forConsole.client.subscribe<Models.Deployment>('console', (message) => {
            if (
                message.events.includes(
                    `sites.${$page.params.site}.deployments.${$page.params.deployment}.update`
                )
            ) {
                if (message.payload.status === 'ready') {
                    invalidate(Dependencies.DEPLOYMENT);
                }
            }
        });
    });

    let showRedeploy = false;
    let showActivate = false;
    let showDelete = false;
    let showCancel = false;
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
            badge={capitalize(data.deployment.status)}
            open
            badgeType={badgeTypeDeployment(data.deployment.status)}
            hideDivider>
            <Logs
                site={data.site}
                deployment={data.deployment}
                hideTitle
                hideScrollButtons
                fullHeight />
            <svelte:fragment slot="end">
                <LogsTimer status={data.deployment.status} deployment={data.deployment} />
            </svelte:fragment>
        </Accordion>
    </Card>
</Container>

{#if showDelete}
    <DeleteDeploymentModal
        selectedDeployment={data.deployment}
        bind:showDelete
        activeDeployment={data.site?.deploymentId} />
{/if}

<CancelDeploymentModal selectedDeployment={data.deployment} bind:showCancel />
<RedeployModal
    selectedDeploymentId={data.deployment.$id}
    bind:show={showRedeploy}
    site={data.site} />
{#if showActivate}
    <ActivateDeploymentModal
        siteId={data.site.$id}
        selectedDeploymentId={data.deployment.$id}
        bind:show={showActivate} />
{/if}
