<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, Divider, Empty, Layout } from '@appwrite.io/pink-svelte';
    import SiteCard from '../(components)/siteCard.svelte';
    import DomainsOverview from './domainsOverview.svelte';
    import DeploymentsOverview from './deploymentsOverview.svelte';
    import { Button } from '$lib/elements/forms';
    import { protocol } from '$routes/(console)/store';
    import InstantRollbackDomain from './instantRollbackDomain.svelte';
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { app } from '$lib/stores/app';
    import EmptyDeploymentDark from './empty-deployment-dark.svg';
    import EmptyDeploymentLight from './empty-deployment-light.svg';

    export let data;
    let showRollback = false;

    $: console.log(data.site);
    $: console.log(data.deployment);
    $: console.log(data.deploymentList);
    $: console.log(data.proxyRuleList);

    // TODO: dark mode empty state
</script>

<Container>
    <Layout.Stack gap="xxxl">
        {#if data?.deployment && data.deployment.status === 'ready'}
            <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList}>
                <svelte:fragment slot="footer">
                    <Button external href={`${$protocol}${data.deployment.domain}`}>Visit</Button>
                    <!-- TODO: disable when disabled={data.hasProdReadyDeployments} -->
                    <Button secondary on:click={() => (showRollback = true)}
                        >Instant rollback</Button>
                </svelte:fragment>
            </SiteCard>
        {:else}
            <Card.Base padding="none">
                <Empty
                    title="Deployment is still building"
                    src={$app.themeInUse === 'dark' ? EmptyDeploymentDark : EmptyDeploymentLight}>
                    <span slot="description">
                        Your build is running. When it completes, this page will automatically
                        update with the latest deployment.
                    </span>
                    <Layout.Stack
                        direction="row"
                        gap="s"
                        alignItems="center"
                        justifyContent="center"
                        slot="actions">
                        <!-- TODO: enable it after we have copy again-->
                        <!-- <Button
                            text
                            href={`${base}/console/project-${$page.params.project}/sites/site-${data.site.$id}/deployments/deployment-${data.deployment.$id}`}>
                            View logs
                        </Button> -->
                        <Button secondary on:click={() => invalidate(Dependencies.SITE)}
                            >Reload</Button>
                    </Layout.Stack>
                </Empty>
            </Card.Base>
        {/if}

        <Divider />

        <Layout.Stack direction="row" gap="xxl" wrap="wrap">
            <div style:flex="1">
                <DomainsOverview proxyRuleList={data.proxyRuleList} />
            </div>
            <div style:flex="2">
                <DeploymentsOverview
                    site={data.site}
                    activeDeployment={data.deployment}
                    deploymentList={data.deploymentList} />
            </div>
        </Layout.Stack>
    </Layout.Stack>
</Container>

{#if showRollback}
    <InstantRollbackDomain
        bind:show={showRollback}
        deployment={data.deployment}
        proxyRuleList={data.proxyRuleList} />
{/if}
