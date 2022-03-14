<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
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
<Back href={`/console/${project}/users`}>Users</Back>
{#if $user}
	<h1>{$user.name}</h1>
	<Tabs />

	<slot />
{/if}
