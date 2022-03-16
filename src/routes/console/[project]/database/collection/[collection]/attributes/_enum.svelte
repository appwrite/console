<script lang="ts">
	import { Modal } from '$lib/components';
	import {
		Button,
		InputText,
		InputBoolean,
		InputSelect,
		Form,
		InputTags
	} from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { createEventDispatcher } from 'svelte';
	import { collection } from '../store';

	let key: string,
		def = '',
		elements: string[],
		required = false,
		array = false;

	const dispatch = createEventDispatcher();
	const submit = async () => {
		try {
			await sdkForProject.database.createEnumAttribute(
				$collection.$id,
				key,
				elements,
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

	$: options =
		elements?.map((e) => ({
			value: e,
			label: e
		})) ?? [];
</script>

<Form on:submit={submit}>
	<Modal on:close={() => dispatch('close')} show>
		<svelte:fragment slot="header">Create Enum Attribute</svelte:fragment>

		<InputText id="key" label="Key" bind:value={key} required autofocus />
		<InputTags
			id="elements"
			label="Elements"
			bind:tags={elements}
			placeholder="Add elements here"
		/>
		<InputSelect id="elements" label="Elements" bind:options bind:value={def} />
		<InputBoolean id="required" label="Required" bind:value={required} />
		<InputBoolean id="required" label="Array" bind:value={array} />

		<svelte:fragment slot="footer">
			<Button secondary on:click={() => dispatch('close')}>Cancel</Button>
			<Button submit>Create</Button>
		</svelte:fragment>
	</Modal>
</Form>
