<script lang="ts">
	import { Modal, InputText, Button } from '$lib/components';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let show = false;

	const dispatch = createEventDispatcher();

	let name: string;

	const create = async () => {
		try {
			await sdkForConsole.teams.create('unique()', name);
			name = null;
			dispatch('created');
		} catch (error) {
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show>
		<span slot="header">Create Project</span>
		<InputText label="Name" bind:value={name} required />
		<footer>
			<Button secondary on:click={() => (show = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
