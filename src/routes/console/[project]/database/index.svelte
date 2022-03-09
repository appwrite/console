<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableRow, TableBody, TableHeader, TableCell } from '$lib/elements/table';
	import { Button } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import Create from './_create.svelte';
	import { goto } from '$app/navigation';
	import type { Models } from 'src/sdk';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;
	const project = $page.params.project;
	const doSearch = () => {
		offset = 0;
	};
	const collectionCreated = async (event: CustomEvent<Models.Collection>) => {
		await goto(`/console/${project}/database/collection/${event.detail.$id}`);
	};

	$: request = sdkForProject.database.listCollections(search, limit, offset);
</script>

<h1>Collections</h1>
<Card>
	<form on:submit|preventDefault={doSearch}>
		<input type="search" bind:value={search} />
	</form>
</Card>

<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>#</TableCell>
				<TableCell>Name</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.collections as collection}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/database/collection/${collection.$id}`}
								>{collection.$id}</a
							>
						</TableCell>
						<TableCell>{collection.name}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Create Collection</Button>
<Create bind:showCreate on:created={collectionCreated} />
