<script lang="ts">
	import { onMount } from 'svelte';
	import { FormItem } from '.';

	export let id: string;
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

<FormItem>
	<label class="label" for={id}>{label}</label>
	<div class="input-text-wrapper is-with-end-button">
		<input
			{placeholder}
			{disabled}
			{required}
			type="text"
			class="input-text"
			bind:value
			bind:this={element}
		/>
		<button
			class="input-button"
			aria-label="Switch"
			on:click={() => (unique = !unique)}
			type="button"
		>
			<span class:icon-edit={unique} class:icon-shuffle={!unique} aria-hidden="true" />
		</button>
	</div>
</FormItem>
