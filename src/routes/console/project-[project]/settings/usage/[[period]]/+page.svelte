<script lang="ts">
    import { Container } from '$lib/layout';
    import { Card, SecondaryTabsItem, SecondaryTabs, Heading } from '$lib/components';
    import { total } from '$lib/layout/usage.svelte';
    import { BarChart } from '$lib/charts';
    import { page } from '$app/stores';

    export let data;

    $: requests = data.response.requests;
    // $: network = data.response.network;
    // $: executions = data.response.executions;
    // $: documents = data.response.documents;
    // $: databases = data.response.databases;
    // $: users = data.response.users;
    // $: storage = data.response.storage;
    // $: buckets = data.response.buckets;
</script>

<Container>
    <div class="u-flex u-main-space-between common-section">
        <Heading tag="h2" size="5">Functions</Heading>
        <SecondaryTabs>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/24h`}
                disabled={($page.params.period ?? '24h') === '24h'}>
                24h
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/30d`}
                disabled={$page.params.period === '30d'}>
                30d
            </SecondaryTabsItem>
            <SecondaryTabsItem
                href={`/console/project-${data.project.$id}/settings/usage/90d`}
                disabled={$page.params.period === '90d'}>
                90d
            </SecondaryTabsItem>
        </SecondaryTabs>
    </div>
    {#if requests}
        <Card>
            <Heading tag="h6" size="6">{total(requests)}</Heading>
            <p>Executions</p>
            <div class="u-margin-block-start-16" />
            <BarChart
                series={[
                    {
                        name: 'Count of function executions over time',
                        data: [...requests.map((e) => [e.date, e.value])]
                    }
                ]} />
        </Card>
    {/if}
</Container>
