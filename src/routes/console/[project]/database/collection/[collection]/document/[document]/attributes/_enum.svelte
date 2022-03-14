<script lang="ts">
	import { InputSelect } from '$lib/elements/forms';
	import { document } from '../store';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let key: string;
	export let attribute: Models.AttributeEnum;

	$: options = attribute.elements.map((element) => {
		return {
			label: element,
			value: element
		};
	});
</script>

<InputSelect bind:value={$document[key]} {options} {id} {label} />
