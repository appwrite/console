<script lang="ts">
	import { Button, InputText } from '$lib/components';
	import InputBoolean from '$lib/components/inputBoolean.svelte';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from '../store';

	export let show: boolean;
	let key: string,
		def: boolean,
		required = false,
		array = false;

	const submit = async () => {
		try {
			await sdkForProject.database.createBooleanAttribute(
				$collection.$id,
				key,
				required,
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

	<InputBoolean label="Required" bind:value={required} />
	<InputBoolean label="Array" bind:value={array} />
	<InputBoolean label="Default" bind:value={def} />

	<footer>
		<Button secondary on:click={() => (show = false)}>Cancel</Button>
		<Button submit>Create</Button>
	</footer>
</form>
