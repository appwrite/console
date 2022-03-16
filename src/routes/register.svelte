<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		Button,
		Form,
		FormItem,
		InputEmail,
		InputPassword,
		InputText
	} from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';

	let name: string, mail: string, pass: string;

	const register = async () => {
		try {
			await sdkForConsole.account.create('unique()', mail, pass, name ?? '');
			await sdkForConsole.account.createSession(mail, pass);
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
	<title>Register</title>
</svelte:head>

<h1>Register</h1>

<Form on:submit={register}>
	<InputText id="name" label="Name" placeholder="John Doe" autofocus={true} bind:value={name} />
	<InputEmail
		id="email"
		label="E-Mail"
		placeholder="test@example.com"
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

	<FormItem><Button submit>Register</Button></FormItem>
</Form>

<a href="/login">Login</a>
