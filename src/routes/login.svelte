<script lang="ts">
	import { goto } from '$app/navigation';

	import { Button, InputEmail, InputPassword } from '$lib/components';
	import { sdkForConsole } from '$lib/stores/sdk';

	let mail: string, pass: string;

	const login = async () => {
		try {
			await sdkForConsole.account.createSession(mail, pass);
			await goto('/console');
		} catch (error) {
			alert(error.message);
		}
	};
</script>

<h1>Login</h1>

<form on:submit|preventDefault={login}>
	<InputEmail
		label="E-Mail"
		placeholder="test@example.com"
		autofocus={true}
		required={true}
		bind:value={mail}
	/>

	<InputPassword label="Password" placeholder="********" required={true} bind:value={pass} />

	<Button submit>Login</Button>
</form>
