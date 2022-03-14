<script lang="ts">
	import { Modal } from '$lib/components';
	import { Button, InputText } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';

	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let name = '';

	const create = async () => {
		try {
			const bucket = await sdkForProject.storage.createBucket('unique()', name, 'bucket');
			name = null;
			showCreate = false;
			dispatch('created', bucket);
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
		<svelte:fragment slot="header">Upload File</svelte:fragment>
		<InputText id="name" label="Name" bind:value={name} autofocus required />
		<svelte:fragment slot="footer">
			<Button submit>Create</Button>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</form>
