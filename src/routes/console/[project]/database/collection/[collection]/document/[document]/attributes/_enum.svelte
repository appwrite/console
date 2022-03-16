<script lang="ts">
	import { InputSelect } from '$lib/elements/forms';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let value: string;
	export let attribute: Models.AttributeEnum;

	$: options = attribute.elements.map((element) => {
		return {
			label: element,
			value: element
		};
	});
</script>

<InputSelect bind:value {options} {id} {label} />
