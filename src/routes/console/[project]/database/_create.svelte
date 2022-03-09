<script lang="ts">
	import { Modal } from '$lib/components';
	import { Button, InputText, InputCustomId } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';

	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let id = '';
	let name = '';

	const create = async () => {
		try {
			const collection = await sdkForProject.database.createCollection(
				id,
				name,
				'collection',
				[],
				[]
			);
			id = name = '';
			showCreate = false;
			dispatch('created', collection);
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
		<span slot="header">Create Collection</span>
		<InputCustomId label="ID" id="id" bind:value={id} />
		<InputText label="Name" id="name" bind:value={name} />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
