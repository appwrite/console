<script lang="ts">
	import { Modal } from '$lib/components';

	import { Button, InputText, InputSwitch, Form } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { collection } from '../store';

	let key: string,
		def: string,
		required = false,
		array = false;

	const dispatch = createEventDispatcher();
	const submit = async () => {
		try {
			await sdkForProject.database.createEmailAttribute(
				$collection.$id,
				key,
				required,
				def ? def : undefined,
				array
			);
			dispatch('close');
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<Form on:submit={submit}>
	<Modal on:close={() => dispatch('close')} show>
		<svelte:fragment slot="header">Create Email Attribute</svelte:fragment>

		<InputText id="key" label="Key" bind:value={key} required autofocus />
		<InputSwitch id="required" label="Required" bind:value={required} />
		<InputSwitch id="required" label="Array" bind:value={array} />
		<InputText id="default" label="Default" bind:value={def} />

		<svelte:fragment slot="footer">
			<Button secondary on:click={() => dispatch('close')}>Cancel</Button>
			<Button submit>Create</Button>
		</svelte:fragment>
	</Modal>
</Form>
