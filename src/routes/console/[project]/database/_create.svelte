<script lang="ts">
	import { Modal } from '$lib/components';
	import { Button, InputFile } from '$lib/elements/forms';

	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let files: FileList;

	const create = async () => {
		try {
			await sdkForProject.storage.createFile('unique()', files[0]);
			files = null;
			showCreate = false;
			dispatch('created');
		} catch (error) {
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show={showCreate}>
		<span slot="header">Upload File</span>
		<InputFile label="Name" bind:files required />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Upload</Button>
		</footer>
	</Modal>
</form>
