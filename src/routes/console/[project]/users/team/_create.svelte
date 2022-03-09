<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let name: string;

	const create = async () => {
		try {
			const team = await sdkForProject.teams.create('unique()', name);
			name = '';
			showCreate = false;
			dispatch('created', team);
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show={showCreate}>
		<span slot="header">Create Team</span>
		<InputText id="name" label="Name" placeholder="John Doe" autofocus={true} bind:value={name} />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
