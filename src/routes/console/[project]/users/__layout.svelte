<script lang="ts">
	import { base } from '$app/paths';

	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { Cover } from '$lib/layout';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Users</title>
</svelte:head>
{#if $page.url.pathname.endsWith(`/users`) || $page.url.pathname.endsWith(`/users/teams`) || $page.url.pathname.endsWith(`/users/usage`) || $page.url.pathname.endsWith(`/users/settings`)}
	<Cover>
		<svelte:fragment slot="breadcrumbs">
			<Back href={`${base}/console/${project}`}>Home</Back>
		</svelte:fragment>
		<svelte:fragment slot="title">Users</svelte:fragment>
		<Tabs />
	</Cover>
{/if}

<slot />
