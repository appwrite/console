<script lang="ts">
	import { Modal } from '$lib/components';

	import { Button, InputNumber, InputText, InputSwitch, Form } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { collection } from '../store';

	const dispatch = createEventDispatcher();

	let key: string,
		min: number,
		max: number,
		def: number,
		required = false,
		array = false;

	const submit = async () => {
		try {
			await sdkForProject.database.createIntegerAttribute(
				$collection.$id,
				key,
				required,
				min,
				max,
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
		<svelte:fragment slot="header">Create Integer Attribute</svelte:fragment>
		<InputText id="key" label="Key" bind:value={key} required autofocus />
		<InputNumber id="min" label="Min" bind:value={min} />
		<InputNumber id="max" label="Max" bind:value={max} />

		<InputSwitch id="required" label="Required" bind:value={required} />
		<InputSwitch id="array" label="Array" bind:value={array} />
		<InputNumber id="default" label="Default" bind:value={def} />

		<svelte:fragment slot="footer">
			<Button secondary on:click={() => dispatch('close')}>Cancel</Button>
			<Button submit>Create</Button>
		</svelte:fragment>
	</Modal>
</Form>
