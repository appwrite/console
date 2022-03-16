<script lang="ts">
	import { page } from '$app/stores';
	import { Card } from '$lib/components';
	import { Form, InputTags } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';
	import { onMount } from 'svelte';
	import { collection } from '../../store';
	import Attribute from './_attribute.svelte';
	import { document } from './store';

	$: documentId = $page.params.document;

	onMount(async () => {
		document.set(await sdkForProject.database.getDocument($collection.$id, documentId));
	});
</script>

<svelte:head>
	<title>Appwrite - Document</title>
</svelte:head>

<h1>Overview</h1>
<Card>
	{#if $document}
		<Form>
			{#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
				{@const value = $document[attribute.key]}
				{#if attribute.array}
					{#each value as _v, index}
						<Attribute
							{index}
							id={`${attribute.key}-${index}`}
							label={index === 0 ? attribute.key : ''}
							key={attribute.key}
							{attribute}
						/>
					{/each}
				{:else}
					<Attribute id={attribute.key} label={attribute.key} key={attribute.key} {attribute} />
				{/if}
			{/each}
			<h1>Permissions</h1>
			<InputTags id="read" label="Read Permissions" tags={$document.$read} />
			<InputTags id="write" label="Write Permissions" tags={$document.$write} />
		</Form>
	{:else}
		loading
	{/if}
</Card>
