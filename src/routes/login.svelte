<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button, Form, FormItem, InputEmail, InputPassword } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';

	let mail: string, pass: string;

	const login = async () => {
		try {
			await sdkForConsole.account.createSession(mail, pass);
			addNotification({
				type: 'success',
				message: 'Successfully logged in.'
			});
			await goto('/console');
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<svelte:head>
	<title>Login</title>
</svelte:head>

<h1>Login</h1>

<Form on:submit={login}>
	<InputEmail
		id="email"
		label="E-Mail"
		placeholder="test@example.com"
		autofocus={true}
		required={true}
		bind:value={mail}
	/>

	<InputPassword
		id="password"
		label="Password"
		placeholder="********"
		required={true}
		bind:value={pass}
	/>
	<FormItem>
		<Button submit>Login</Button>
	</FormItem>
</Form>

<a href="/register">Create an Account</a>
