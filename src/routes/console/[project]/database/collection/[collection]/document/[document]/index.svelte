<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Collapsible, Copy } from '$lib/components';
	import { Button, Form, InputTags } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';
	import { onMount } from 'svelte';
	import { collection } from '../../store';
	import { doc } from './store';
	import { addNotification } from '$lib/stores/notifications';
	import Attribute from './_attribute.svelte';

	$: documentId = $page.params.document;

	onMount(async () => {
		$doc = await sdkForProject.database.getDocument($collection.$id, documentId);
	});

	const updateDocument = async () => {
		try {
			$doc = await sdkForProject.database.updateDocument(
				$collection.$id,
				documentId,
				$doc,
				$doc.$read,
				$doc.$write
			);
			addNotification({
				message: 'Document was updated!',
				type: 'success'
			});
		} catch (error) {
			addNotification({
				message: error.message,
				type: 'error'
			});
		}
	};
</script>

<svelte:head>
	<title>Appwrite - Document</title>
</svelte:head>

<h1>Overview</h1>
<Card>
	{#if $doc}
		<Form on:submit={updateDocument}>
			<Copy value={$doc.$id} />
			{#each $collection.attributes.filter((a) => a.status === 'available') as attribute}
				{#if attribute.array}
					{#each $doc[attribute.key] as _v, index}
						<Attribute
							{attribute}
							id={`${attribute.key}-${index}`}
							label={index === 0 ? attribute.key : ''}
							bind:value={$doc[attribute.key][index]}
						/>
						<Button on:click={() => doc.removeAttribute(attribute.key, index)}>X</Button>
					{:else}
						<p>{attribute.key}</p>
					{/each}
					<Button on:click={() => doc.addAttribute(attribute.key)}>Add Attribute</Button>
				{:else}
					<Attribute
						{attribute}
						id={attribute.key}
						label={attribute.key}
						bind:value={$doc[attribute.key]}
					/>
				{/if}
			{/each}
			<Collapsible>
				<svelte:fragment slot="header">Permissions</svelte:fragment>
				<InputTags
					id="read"
					label="Read Permissions"
					bind:tags={$doc.$read}
					helper="Add 'role:all' for wildcard access"
					placeholder="User ID, Team ID or Role"
				/>
				<InputTags
					id="write"
					label="Write Permissions"
					bind:tags={$doc.$write}
					helper="Add 'role:all' for wildcard access"
					placeholder="User ID, Team ID or Role"
				/>
			</Collapsible>
			<Button submit>Update</Button>
		</Form>
	{:else}
		loading
	{/if}
</Card>
