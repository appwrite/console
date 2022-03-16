<script lang="ts">
	import { InputNumber } from '$lib/elements/forms';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let value: number;
	export let attribute: Models.AttributeInteger;
</script>

<InputNumber
	{id}
	{label}
	required={attribute.required}
	minlength={attribute.min}
	maxlength={attribute.max}
	bind:value
/>
