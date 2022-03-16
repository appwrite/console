<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button, Form } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { project } from '../store';

	export let show = false;

	let domain: string;

	const dispatch = createEventDispatcher();
	const create = async () => {
		try {
			await sdkForConsole.projects.createDomain($project.$id, domain);
			domain = null;
			show = false;
			dispatch('created');
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<Form on:submit={create}>
	<Modal bind:show>
		<svelte:fragment slot="header">Add Domain</svelte:fragment>
		<InputText id="domain" label="Domain" bind:value={domain} required />
		<svelte:fragment slot="footer">
			<Button submit>Create</Button>
			<Button secondary on:click={() => (show = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</Form>
