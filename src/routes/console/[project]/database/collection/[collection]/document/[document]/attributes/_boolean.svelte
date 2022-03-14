<script lang="ts">
	import { InputBoolean } from '$lib/elements/forms';
	import { document } from '../store';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let key: string;
	export let attribute: Models.AttributeInteger;
</script>

<InputBoolean {id} bind:value={$document[key]} {label} required={attribute.required} />
