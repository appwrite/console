<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination, Tile, Tiles } from '$lib/components';
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
	<Tiles>
		{#each response.collections as collection}
			<Tile
				href={`/console/${project}/database/collection/${collection.$id}`}
				title={collection.name}
			/>
		{/each}
	</Tiles>
	<Pagination {limit} bind:offset sum={response.total} />
{/await}

<Button on:click={() => (showCreate = true)}>Create Collection</Button>
<Create bind:showCreate on:created={collectionCreated} />
