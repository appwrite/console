<script lang="ts">
	import { goto } from '$app/navigation';

	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';

	const logout = async () => {
		await sdkForConsole.account.deleteSession('current');
		await goto('/login');
	};
</script>

<h1>hey</h1>

<Button on:click={logout}>Logout</Button>
