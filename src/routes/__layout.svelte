<script context="module">
	import 'aw-labs-ui/src/_index.scss';
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';
	import Notifications from '$lib/layout/notifications.svelte';

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

<Notifications />

<slot />
