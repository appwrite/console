<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { user } from './store';
	import Tabs from './_tabs.svelte';

	const userId = $page.params.user;

	$: {
		if (browser) {
			user.load(userId);
		}
	}
</script>

{#if $user}
	<h1>{$user.name}</h1>
	<Tabs />

	<slot />
{/if}
