<script>
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

{#if $page.url.pathname === `/console/${project}/functions/`}
	<Back href={`/console/${project}`}>Home</Back>
	<h1>Functions</h1>
	<Tabs />
{/if}
<slot />
