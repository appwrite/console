<script lang="ts">
	import InputText from '$lib/elements/forms/inputText.svelte';
	import type { Models } from 'src/sdk';
	import { document } from '../store';

	export let id: string;
	export let label: string;
	export let key: string;
	export let attribute: Models.AttributeString;
</script>

<InputText
	{id}
	bind:value={$document[key]}
	{label}
	required={attribute.required}
	maxlength={attribute.size}
/>
