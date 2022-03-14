<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Empty, Pagination, Tile, Tiles } from '$lib/components';
	import Create from './_create.svelte';
	import { goto } from '$app/navigation';
	import type { Models } from 'src/sdk';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const collectionCreated = async (event: CustomEvent<Models.Collection>) => {
		await goto(`/console/${project}/database/collection/${event.detail.$id}`);
	};

	$: request = sdkForProject.database.listCollections(search, limit, offset);
	$: if (search) offset = 0;
</script>

<h1>Collections</h1>
<Card>
	<InputSearch bind:value={search} />
</Card>

{#await request}
	<div aria-busy="true" />
{:then response}
	{#if response.total}
		<Tiles>
			{#each response.collections as collection}
				<Tile
					href={`/console/${project}/database/collection/${collection.$id}`}
					title={collection.name}
				/>
			{/each}
		</Tiles>
		<Pagination {limit} bind:offset sum={response.total} />
	{:else if search}
		<Empty>
			<svelte:fragment slot="header">No results found for <b>{search}</b></svelte:fragment>
		</Empty>
	{:else}
		<Empty>
			<svelte:fragment slot="header">No Collections Found</svelte:fragment>
			You haven't created any collections for your project yet.
		</Empty>
	{/if}
{/await}

<Button on:click={() => (showCreate = true)}>Create Collection</Button>
<Create bind:showCreate on:created={collectionCreated} />
