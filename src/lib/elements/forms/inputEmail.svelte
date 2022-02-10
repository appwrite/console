<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string;
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let autofocus = false;
	export let disabled = false;

	let element: HTMLInputElement;

	onMount(() => {
		if (element && autofocus) {
			element.focus();
		}
	});
</script>

<label>
	<span>{label}</span>
	<input {placeholder} {required} {disabled} type="email" bind:value bind:this={element} />
</label>
