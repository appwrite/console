<script lang="ts">
	import { InputBoolean } from '$lib/elements/forms';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let value: boolean;
	export let attribute: Models.AttributeInteger;
</script>

<InputBoolean {id} {label} required={attribute.required} bind:value />
