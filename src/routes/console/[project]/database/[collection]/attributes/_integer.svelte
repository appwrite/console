<script lang="ts">
	import { Button, InputNumber, InputText, InputBoolean } from '$lib/elements/forms';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from '../store';

	export let show: boolean;
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
	<div class="grid">
		<InputNumber id="min" label="Min" bind:value={min} />
		<InputNumber id="max" label="Max" bind:value={max} />
	</div>

	<InputBoolean id="required" label="Required" bind:value={required} />
	<InputBoolean id="array" label="Array" bind:value={array} />
	<InputNumber id="default" label="Default" bind:value={def} />

	<footer>
		<Button secondary on:click={() => (show = false)}>Cancel</Button>
		<Button submit>Create</Button>
	</footer>
</form>
