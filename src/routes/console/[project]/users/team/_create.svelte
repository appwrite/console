<script lang="ts">
	import { Button, InputText, Modal } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';

	export let showCreate = false;

	const dispatch = createEventDispatcher();

	let name: string;

	const create = async () => {
		try {
			await sdkForProject.teams.create('unique()', name);
			name = '';
			showCreate = false;
			dispatch('created');
		} catch (error) {
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show={showCreate}>
		<span slot="header">Create Team</span>
		<InputText label="Name" placeholder="John Doe" autofocus={true} bind:value={name} />
		<footer>
			<Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
			<Button submit>Create</Button>
		</footer>
	</Modal>
</form>
