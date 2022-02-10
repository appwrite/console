<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button, InputCustomId } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let show = false;
	export let teamId: string;

	const dispatch = createEventDispatcher();

	let id: string;
	let name: string;

	const create = async () => {
		try {
			await sdkForConsole.projects.create(id, name, teamId);
			id = name = null;
			dispatch('created');
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show>
		<span slot="header">Create Project</span>
		<InputCustomId label="ID" bind:value={id} required />
		<InputText label="Name" bind:value={name} required />
		<footer>
			<Button secondary on:click={() => (show = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
