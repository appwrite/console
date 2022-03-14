<script lang="ts">
	import { Button, InputText } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from '../store';

	const update = async () => {
		try {
			await sdkForConsole.projects.update($project.$id, $project.name);
			await project.load($project.$id);
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<h1>Overview</h1>
{#if $project}
	<article>
		<form on:submit|preventDefault={update}>
			<InputText id="name" label="Name" bind:value={$project.name} required />
			<Button submit>Update</Button>
		</form>
	</article>
{/if}
