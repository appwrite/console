<script lang="ts">
	import { InputTags, Button, InputFile } from '$lib/elements/forms';
	import { Modal } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { addNotification } from '$lib/stores/notifications';
	import { page } from '$app/stores';

	export let showCreate = false;

	const bucket = $page.params.bucket;
	const dispatch = createEventDispatcher();

	let files: FileList;
	let read: string[] = [];
	let write: string[] = [];

	const create = async () => {
		try {
			await sdkForProject.storage.createFile(bucket, 'unique()', files[0], read, write);
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
		<svelte:fragment slot="header">Upload File</svelte:fragment>
		<InputFile id="file" label="File" bind:files required />
		<InputTags id="read" label="Read" bind:tags={read} />
		<InputTags id="write" label="Write" bind:tags={write} />
		<svelte:fragment slot="footer">
			<Button submit>Upload</Button>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</form>
