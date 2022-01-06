<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	onMount(async () => {
		try {
			if (!$user) {
				user.set(await sdkForConsole.account.get());
			}

			if (!$page.url.pathname.startsWith('/console')) {
				await goto('/console');
			}
		} catch (error) {
			console.error(error);
		}
	});
</script>

<main class="container">
	<slot />
</main>

<style lang="scss" global>
	$primary-500: #f02e65;
	$primary-600: #d81b60;
	$primary-700: #c2185b;

	@import '@picocss/pico/scss/pico';
</style>
