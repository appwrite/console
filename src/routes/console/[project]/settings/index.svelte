<script lang="ts">
	import { Card } from '$lib/components';
	import { Button, Form, FormItem, InputText } from '$lib/elements/forms';
	import { Container } from '$lib/layout';
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

<Container>
	<h1>Overview</h1>
	{#if $project}
		<Card>
			<Form on:submit={update}>
				<InputText id="name" label="Name" bind:value={$project.name} required />
				<FormItem>
					<Button submit>Update</Button>
				</FormItem>
			</Form>
		</Card>
	{/if}
</Container>
