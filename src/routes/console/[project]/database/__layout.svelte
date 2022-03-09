<script>
	import { page } from '$app/stores';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<h1>Database</h1>
{#if $page.url.pathname === `/console/${project}/database` || $page.url.pathname === `/console/${project}/database/@usage`}
	<Tabs />
{/if}

<slot />
