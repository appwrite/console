<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string;
	export let id: string;
	export let value: number = null;
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let autofocus = false;

	let element: HTMLInputElement;

	onMount(() => {
		if (element && autofocus) {
			element.focus();
		}
	});
</script>

<label class="label" for={id}>{label}</label>
<div class="input-text-wrapper">
	<input
		{id}
		{placeholder}
		{disabled}
		{required}
		type="number"
		class="input-text"
		bind:value
		bind:this={element}
	/>
</div>
