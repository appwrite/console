<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string;
	export let value = '';
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

<label>
	<span>{label}</span>
	<input {placeholder} {disabled} {required} type="text" bind:value bind:this={element} />
</label>
