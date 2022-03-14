<script>
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Settings</title>
</svelte:head>

<Back href={`/console/${project}`}>Home</Back>
<h1>Settings</h1>
<Tabs />

<slot />
