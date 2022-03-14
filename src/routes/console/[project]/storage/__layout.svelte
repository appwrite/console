<script>
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Storage</title>
</svelte:head>
{#if $page.url.pathname === `/console/${project}/storage/` || $page.url.pathname === `/console/${project}/storage/usage/`}
	<Back href={`/console/${project}`}>Home</Back>
	<h1>Storage</h1>
	<Tabs />
{/if}
<slot />
