<script lang="ts">
	import { InputNumber } from '$lib/elements/forms';
	import { document } from '../store';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let key: string;
	export let attribute: Models.AttributeInteger;
</script>

<InputNumber
	{id}
	bind:value={$document[key]}
	{label}
	required={attribute.required}
	minlength={attribute.min}
	maxlength={attribute.max}
/>
