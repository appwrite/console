<script lang="ts">
	import { Button, InputNumber, InputText, InputBoolean } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from '../store';

	export let show: boolean;
	let key: string,
		def: string,
		size = 255,
		required = false,
		array = false;

	const submit = async () => {
		try {
			await sdkForProject.database.createStringAttribute(
				$collection.$id,
				key,
				size,
				required,
				def ? def : undefined,
				array
			);
			show = false;
		} catch (error) {
			addNotification({
				type: 'error',
				message: error.message
			});
		}
	};
</script>

<form on:submit|preventDefault={submit}>
	<InputText id="key" label="Key" bind:value={key} required autofocus />
	<InputNumber id="size" label="Size" bind:value={size} required />
	<InputBoolean id="required" label="Required" bind:value={required} />
	<InputBoolean id="required" label="Array" bind:value={array} />
	<InputText id="default" label="Default" bind:value={def} />

	<footer>
		<Button secondary on:click={() => (show = false)}>Cancel</Button>
		<Button submit>Create</Button>
	</footer>
</form>
