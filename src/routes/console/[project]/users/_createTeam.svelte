<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button, Form } from '$lib/elements/forms';
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

<Form on:submit={create}>
	<Modal bind:show={showCreate}>
		<svelte:fragment slot="header">Create Team</svelte:fragment>
		<InputText id="name" label="Name" placeholder="John Doe" autofocus={true} bind:value={name} />
		<svelte:fragment slot="footer">
			<Button submit>Create</Button>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</Form>
