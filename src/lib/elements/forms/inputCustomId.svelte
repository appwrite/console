<script lang="ts">
	import { onMount } from 'svelte';

	export let label: string;
	export let value = '';
	export let placeholder = '';
	export let required = false;
	export let disabled = false;
	export let autofocus = false;

	let element: HTMLInputElement;
	let unique = true;

	$: {
		if (unique) {
			value = 'unique()';
			disabled = true;
		} else {
			value = '';
			disabled = false;
		}
	}

	onMount(() => {
		if (element && autofocus) {
			element.focus();
		}
	});
</script>

<label>
	<span>{label} <span role="button" on:click={() => (unique = !unique)}>Switch</span></span>
	<input {placeholder} {disabled} {required} type="text" bind:value bind:this={element} />
</label>
