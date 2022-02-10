<script lang="ts">
	import { InputTags, Button, InputFile } from '$lib/elements/forms';
	import { Modal } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { addNotification } from '$lib/stores/notifications';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let files: FileList;
	let read: string[] = [];
	let write: string[] = [];

	const create = async () => {
		try {
			await sdkForProject.storage.createFile('unique()', files[0], read, write);
			files = null;
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
		<InputFile label="Name" bind:files required />
		<InputTags label="Read" bind:tags={read} />
		<InputTags label="Write" bind:tags={write} />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Upload</Button>
		</footer>
	</Modal>
</form>
