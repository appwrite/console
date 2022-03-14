<script>
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Database</title>
</svelte:head>
{#if $page.url.pathname === `/console/${project}/database/` || $page.url.pathname === `/console/${project}/database/usage/`}
	<Back href={`/console/${project}`}>Home</Back>
	<h1>Database</h1>
	<Tabs />
{/if}

<slot />
