<script lang="ts">
	import { page } from '$app/stores';
	import { Back, Card } from '$lib/components';
	import { Button, Form } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';
	import { onMount } from 'svelte';
	import { collection } from '../store';
	import { doc } from './[document]/store';
	import { addNotification } from '$lib/stores/notifications';
	import Document from './[document]/_document.svelte';
	import { goto } from '$app/navigation';
	import InputCustomId from '$lib/elements/forms/inputCustomId.svelte';
	import { Container, Cover } from '$lib/layout';

	$: projectId = $page.params.project;

	onMount(() => {
		doc.set({
			$collection: $page.params.collection,
			$id: null,
			$read: [],
			$write: []
		});
	});

	const createDocument = async () => {
		try {
			const created = await sdkForProject.database.createDocument(
				$collection.$id,
				$doc.$id,
				{
					...$doc,
					$id: undefined
				},
				$doc.$read,
				$doc.$write
			);
			addNotification({
				message: 'Document was created!',
				type: 'success'
			});
			await goto(
				`/console/${projectId}/database/collection/${created.$collection}/document/${created.$id}`
			);
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
{#if $doc && $collection}
	<Cover>
		<Back href={`/console/${projectId}/database/collection/${$collection.$id}`}>
			Collection - {$collection.name}
		</Back>
		<h1>Create Document</h1>
	</Cover>
	<Container>
		<Card>
			<Form on:submit={createDocument}>
				<InputCustomId id="id" label="Document ID" bind:value={$doc.$id} />
				<Document />
				<Button submit>Create</Button>
			</Form>
		</Card>
	</Container>
{:else}
	<div aria-busy="true" />
{/if}
