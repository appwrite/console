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
			await sdkForProject.storage.createBucket('unique()', name, 'bucket');
			name = null;
			showCreate = false;
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
	<Modal bind:show={showCreate}>
		<span slot="header">Upload File</span>
		<InputText id="name" label="Name" bind:value={name} required />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Upload</Button>
		</footer>
	</Modal>
</form>
