<script lang="ts">
	import { onMount } from 'svelte';

	export let id: string;
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

	$: strength = value.length * 10;
</script>

<label class="label" for={id}>{label}</label>
<div class="input-text-wrapper">
	<input
		{id}
		{placeholder}
		{disabled}
		{required}
		type="password"
		class="input-text"
		bind:value
		bind:this={element}
	/>
	<meter
		value={strength > 100 ? 100 : strength}
		min="0"
		max="100"
		class="password-meter"
		class:is-weak={strength !== 0 && strength <= 33}
		class:is-medium={strength > 33 && strength <= 66}
		class:is-strong={strength > 66 && strength <= 100}
		aria-label="Password strength week"
	/>
</div>
