<script lang="ts">
    import { Container } from '$lib/layout';
    import { Divider, Layout } from '@appwrite.io/pink-svelte';
    import SiteCard from '../(components)/siteCard.svelte';
    import DomainsOverview from './domainsOverview.svelte';
    import DeploymentsOverview from './deploymentsOverview.svelte';

    export let data;

    $: console.log(data.site);
    $: console.log(data.deployment);
    $: console.log(data.proxyRuleList);
</script>

<Container>
    <Layout.Stack gap="xxl">
        <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList} />

        <Divider />
        <Layout.Stack direction="row" gap="xxl">
            <DomainsOverview proxyRuleList={data.proxyRuleList} />
            <DeploymentsOverview
                activeDeployment={data.deployment}
                deploymentList={data.deploymentList} />
        </Layout.Stack>
    </Layout.Stack>
</Container>
