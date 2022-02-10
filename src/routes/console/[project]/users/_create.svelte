<script lang="ts">
	import { Modal } from '$lib/components';
	import { Button, InputPassword, InputEmail, InputText } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let name: string, mail: string, pass: string;

	const create = async () => {
		try {
			await sdkForProject.users.create('unique()', mail, pass, name);
			mail = pass = name = '';
			showCreate = false;
			dispatch('created');
		} catch (error) {
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show={showCreate}>
		<span slot="header">Create User</span>
		<InputText label="Name" placeholder="John Doe" autofocus={true} bind:value={name} />
		<InputEmail label="E-Mail" placeholder="test@example.com" required={true} bind:value={mail} />
		<InputPassword label="Password" placeholder="*****" required={true} bind:value={pass} />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
