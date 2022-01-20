<script lang="ts">
	import { Button, InputText } from '$lib/components';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';

	const update = async () => {
		try {
			await sdkForConsole.projects.update($project.$id, $project.name);
			await project.load($project.$id);
		} catch (error) {
			alert(error.message);
		}
	};
</script>

{#if $project}
	<h2>Overview</h2>
	<article>
		<form on:submit|preventDefault={update}>
			<InputText label="Name" bind:value={$project.name} required />
			<Button submit>Update</Button>
		</form>
	</article>
{/if}

<style>
	h2 {
		margin-bottom: 0;
	}
</style>
