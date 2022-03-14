<script lang="ts">
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Users</title>
</svelte:head>
{#if $page.url.pathname.endsWith(`/users/`) || $page.url.pathname.endsWith(`/users/team/`) || $page.url.pathname.endsWith(`/users/usage/`) || $page.url.pathname.endsWith(`/users/settings/`)}
	<Back href={`/console/${project}`}>Home</Back>
	<h1>Users</h1>
	<Tabs />
{/if}

<slot />
