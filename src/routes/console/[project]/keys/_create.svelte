<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button, Form, InputCheckbox } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from '../store';
	import { scopes } from '$lib/constants';
	export let show = false;

	let name: string;
	const activeScopes = scopes.reduce((prev, next) => {
		prev[next] = false;

		return prev;
	}, {});

	const create = async () => {
		try {
			await sdkForConsole.projects.createKey(
				$project.$id,
				name,
				scopes.filter((scope) => activeScopes[scope])
			);
			name = null;
			for (const scope in activeScopes) {
				activeScopes[scope] = false;
			}

			await project.load($project.$id);
			show = false;
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
		<svelte:fragment slot="header">Add API Key</svelte:fragment>
		<InputText id="name" label="Name" bind:value={name} required />
		{#each scopes as scope}
			<InputCheckbox id={scope} label={scope} bind:value={activeScopes[scope]} />
		{/each}
		<svelte:fragment slot="footer">
			<Button submit>Create</Button>
			<Button secondary on:click={() => (show = false)}>Cancel</Button>
		</svelte:fragment>
	</Modal>
</Form>
