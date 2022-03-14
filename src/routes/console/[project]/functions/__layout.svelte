<script>
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Functions</title>
</svelte:head>
{#if !$page.url.pathname.startsWith(`/console/${project}/functions/function`)}
	<Back href={`/console/${project}`}>Home</Back>
	<h1>Functions</h1>
	<Tabs />
{/if}
<slot />
