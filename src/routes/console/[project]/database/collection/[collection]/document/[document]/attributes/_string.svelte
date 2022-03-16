<script lang="ts">
	import InputText from '$lib/elements/forms/inputText.svelte';
	import type { Models } from 'src/sdk';

	export let id: string;
	export let label: string;
	export let value: string;
	export let attribute: Models.AttributeString;
</script>

<InputText {id} {label} required={attribute.required} maxlength={attribute.size} bind:value />
