<script lang="ts">
	import type { Models } from 'src/sdk';
	import Boolean from './attributes/_boolean.svelte';
	import Enum from './attributes/_enum.svelte';
	import Integer from './attributes/_integer.svelte';
	import String from './attributes/_string.svelte';

	export let id: string;
	export let label: string;
	export let key: string;
	export let index: number = null;
	export let attribute:
		| Models.AttributeBoolean
		| Models.AttributeEmail
		| Models.AttributeEnum
		| Models.AttributeFloat
		| Models.AttributeInteger
		| Models.AttributeIp
		| Models.AttributeString
		| Models.AttributeUrl;

	const attributesTypeMap = {
		string: String,
		integer: Integer,
		double: Integer,
		boolean: Boolean
	};

	const attributesFormatMap = {
		ip: String,
		url: String,
		email: String,
		enum: Enum
	};
</script>

{#if attribute.type in attributesTypeMap}
	{#if 'format' in attribute}
		<svelte:component
			this={attributesFormatMap[attribute.format]}
			{id}
			{key}
			{label}
			{attribute}
			{index}
		/>
	{:else}
		<svelte:component
			this={attributesTypeMap[attribute.type]}
			{id}
			{key}
			{label}
			{attribute}
			{index}
		/>
	{/if}
{/if}
