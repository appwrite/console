<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, Divider, Empty, Layout, Tooltip } from '@appwrite.io/pink-svelte';
    import SiteCard from '../(components)/siteCard.svelte';
    import DomainsOverview from './domainsOverview.svelte';
    import DeploymentsOverview from './deploymentsOverview.svelte';
    import { Button } from '$lib/elements/forms';
    import { protocol } from '$routes/(console)/store';
    import InstantRollbackDomain from './instantRollbackModal.svelte';
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { base } from '$app/paths';

    export let data;
    let showRollback = false;

    onMount(() => {
        return sdk.forConsole.client.subscribe('console', (response) => {
            if (response.events.includes(`sites.${page.params.site}.deployments.*`)) {
                invalidate(Dependencies.SITE);
            }
        });
    });
</script>

<Container>
    <Layout.Stack gap="xxxl">
        {#if data?.deployment && data.deployment.status === 'ready'}
            <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList}>
                <svelte:fragment slot="footer">
                    {#if data.proxyRuleList.total}
                        <Button
                            external
                            href={`${$protocol}${data.proxyRuleList.rules[0]?.domain}`}>
                            Visit
                        </Button>
                    {/if}
                    <Tooltip disabled={data.hasProdReadyDeployments}>
                        <div>
                            <Button
                                secondary
                                on:click={() => (showRollback = true)}
                                disabled={!data.hasProdReadyDeployments}>
                                Instant rollback
                            </Button>
                        </div>
                        <span slot="tooltip">
                            Rollback is possible only if there is a deployment that is ready and was
                            active.
                        </span>
                    </Tooltip>
                </svelte:fragment>
            </SiteCard>
        {:else if data.deployment?.status === 'building'}
            <Card.Base padding="none">
                <Empty
                    title="Deployment is still building"
                    src={$app.themeInUse === 'dark'
                        ? `${base}/images/empty-deployment-dark.svg`
                        : `${base}/images/empty-deployment-light.svg`}>
                    <span slot="description">
                        Your build is running. When it completes, this page will automatically
                        update with the latest deployment.
                    </span>
                </Empty>
            </Card.Base>
        {:else}
            <Card.Base padding="none">
                <Empty
                    title="There is no active deployment"
                    src={$app.themeInUse === 'dark'
                        ? `${base}/images/empty-deployment-dark.svg`
                        : `${base}/images/empty-deployment-light.svg`}>
                    <span slot="description">
                        Deploy your site to get started. Once deployed, you'll see your latest build
                        details here.
                    </span>
                </Empty>
            </Card.Base>
        {/if}

        <Divider />

        <Layout.GridFraction gap="xxl" start={1} end={2} breakpoint="m">
            <DomainsOverview proxyRuleList={data.proxyRuleList} />
            <DeploymentsOverview
                site={data.site}
                activeDeployment={data.deployment}
                deploymentList={data.deploymentList} />
        </Layout.GridFraction>
    </Layout.Stack>
</Container>

{#if showRollback}
    <InstantRollbackDomain
        bind:show={showRollback}
        deployment={data.deployment}
        proxyRuleList={data.proxyRuleList}
        prodReadyDeployments={data.prodReadyDeployments} />
{/if}
