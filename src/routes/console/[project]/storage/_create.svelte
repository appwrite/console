<script lang="ts">
	import Button from '$lib/components/button.svelte';
	import InputFile from '$lib/components/inputFile.svelte';
	import InputTags from '$lib/components/inputTags.svelte';
	import Modal from '$lib/components/modal.svelte';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

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
			alert(error.message);
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
