<script lang="ts">
    import Container from '$lib/layout/container.svelte';
    import SiteCard from '../(components)/siteCard.svelte';

    export let data;

    $: console.log(data.site);
    $: console.log(data.deployment);
    $: console.log(data.proxyRuleList);
</script>

<Container>
    <SiteCard deployment={data.deployment} proxyRuleList={data.proxyRuleList} />
</Container>
