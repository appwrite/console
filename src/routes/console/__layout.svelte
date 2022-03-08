<script lang="ts">
	import { goto } from '$app/navigation';
	import Shell from '$lib/layout/shell.svelte';
	import SideNavigation from '$lib/layout/navigation.svelte';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import Header from '$lib/layout/header.svelte';

	onMount(async () => {
		try {
			if (!$user) {
				user.set(await sdkForConsole.account.get());
			}
		} catch (error) {
			await goto('/login');
		}
	});
</script>

<Shell>
	<svelte:fragment slot="header">
		<Header />
	</svelte:fragment>
	<svelte:fragment slot="side">
		<SideNavigation />
	</svelte:fragment>
	<slot />
</Shell>
