<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms/index.js';
    import Container from '$lib/layout/container.svelte';
    import { sdk } from '$lib/stores/sdk.js';
    import SiteCard from './siteCard.svelte';

    export let data;
    let files = null;

    async function deployment() {
        try {
            console.log(files);
            await sdk.forProject.sites.createDeployment($page.params.site, files[0], true);
            console.log('success');
        } catch (e) {
            console.log(e);
        }
    }

    $: console.log(data.site);
    $: console.log(data.deployment);
    $: console.log(data.proxyRuleList);
</script>

<Container>
    <SiteCard site={data.site} deployment={data.deployment} proxyRuleList={data.proxyRuleList} />
    <input type="file" name="" id="" bind:files />

    <div>
        <Button on:click={deployment}>I'm a button!</Button>
    </div>
</Container>

<style>
</style>
