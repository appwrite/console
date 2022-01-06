<script lang="ts">
	import { Button, InputNumber, InputText } from '$lib/components';
	import InputBoolean from '$lib/components/inputBoolean.svelte';
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
			alert(error.message);
		}
	};
</script>

<form on:submit|preventDefault={submit}>
	<InputText label="Key" bind:value={key} required autofocus />
	<div class="grid">
		<InputNumber label="Min" bind:value={min} />
		<InputNumber label="Max" bind:value={max} />
	</div>

	<InputBoolean label="Required" bind:value={required} />
	<InputBoolean label="Array" bind:value={array} />
	<InputNumber label="Default" bind:value={def} />

	<footer>
		<Button secondary on:click={() => (show = false)}>Cancel</Button>
		<Button submit>Create</Button>
	</footer>
</form>
