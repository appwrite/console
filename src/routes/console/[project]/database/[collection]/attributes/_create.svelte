<script lang="ts">
	import { Modal } from '$lib/components';
	import type { SvelteComponent } from 'svelte';
	import Boolean from './_boolean.svelte';
	import Integer from './_integer.svelte';
	import String from './_string.svelte';

	export let show = false;

	type Option = {
		name: string;
		component: typeof SvelteComponent;
	};

	const options: Option[] = [
		{
			name: 'String',
			component: String
		},
		{
			name: 'Integer',
			component: Integer
		},
		{
			name: 'Boolean',
			component: Boolean
		}
	];

	let selected: Option;
	let element: HTMLSelectElement;

	const change = () => {
		selected = options[element.value];
	};
</script>

<Modal bind:show>
	<span slot="header">
		{#if selected}
			Create {selected.name} Attribute
		{/if}
	</span>

	<label>
		<span>Type</span>
		<select required on:change={change} bind:this={element}>
			<option value="-1" selected>Select a type…</option>
			{#each options as option, index}
				<option class="option" value={index}>{option.name}</option>
			{/each}
		</select>
	</label>
	{#if selected}
		<svelte:component this={selected.component} bind:show />
	{/if}
</Modal>
