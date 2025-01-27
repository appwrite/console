<script lang="ts">
    import { Container } from '$lib/layout';
    import { Divider, Layout } from '@appwrite.io/pink-svelte';
    import SiteCard from '../(components)/siteCard.svelte';
    import DomainsOverview from './domainsOverview.svelte';
    import DeploymentsOverview from './deploymentsOverview.svelte';
    import { Button } from '$lib/elements/forms';
    import { protocol } from '$routes/(console)/store';
    import InstantRollbackDomain from './instantRollbackDomain.svelte';

    export let data;
    let showRollback = false;

    $: console.log(data.site);
    $: console.log(data.deployment);
    $: console.log(data.deploymentList);
    $: console.log(data.proxyRuleList);
</script>

<Container>
    <Layout.Stack gap="xxl">
        <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList}>
            <svelte:fragment slot="footer">
                <Button external href={`${$protocol}${data.deployment.domain}`}>Visit</Button>
                <!-- TODO: disable when disabled={data.hasProdReadyDeployments} -->
                <Button secondary on:click={() => (showRollback = true)}>Instant rollback</Button>
            </svelte:fragment>
        </SiteCard>

        <Divider />

        <Layout.Stack direction="row" gap="xxl" wrap="wrap">
            <div style:flex="1">
                <DomainsOverview proxyRuleList={data.proxyRuleList} />
            </div>
            <div style:flex="2">
                <DeploymentsOverview
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
