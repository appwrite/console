<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { Cover } from '$lib/layout';
	import { user } from './store';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
	const userId = $page.params.user;

	$: {
		if (browser) {
			user.load(userId);
		}
	}
</script>

<svelte:head>
	<title>Appwrite - User</title>
</svelte:head>

{#if $user}
	<Cover>
		<svelte:fragment slot="breadcrumbs">
			<Back href={`/console/${project}/users`}>Users</Back>
		</svelte:fragment>
		<svelte:fragment slot="title">{$user.name}</svelte:fragment>
		<Tabs />
	</Cover>
	<slot />
{/if}
