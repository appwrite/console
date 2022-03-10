<script lang="ts">
	import { goto } from '$app/navigation';

	import { Button } from '$lib/elements/forms';
	import { app } from '$lib/stores/app';
	import { sdkForConsole } from '$lib/stores/sdk';

	const logout = async () => {
		await sdkForConsole.account.deleteSession('current');
		await goto('/login');
	};
	const toggleTheme = () => {
		$app.theme = $app.theme === 'light' ? 'dark' : 'light';
	};
</script>

<h1>hey</h1>
<Button on:click={toggleTheme}>toggle Theme</Button>
<Button on:click={logout}>Logout</Button>
