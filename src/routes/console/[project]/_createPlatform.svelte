<script lang="ts">
	import { Modal } from '$lib/components';
	import { InputText, Button } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';

	export let show = false;

	let name: string;
	let hostname: string;

	const create = async () => {
		try {
			await sdkForConsole.projects.createPlatform(
				$project.$id,
				'web',
				name,
				undefined,
				undefined,
				hostname
			);
			name = hostname = null;
			project.load($project.$id);
			show = false;
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<form on:submit|preventDefault={create}>
	<Modal bind:show>
		<span slot="header">Add Platform</span>
		<InputText label="Name" bind:value={name} required />
		<InputText label="Hostname" bind:value={hostname} required />
		<footer>
			<Button secondary on:click={() => (show = false)}>Cancel</Button>
			<Button submit>Register</Button>
		</footer>
	</Modal>
</form>
