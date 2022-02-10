<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableRow, TableBody, TableHeader, TableCell } from '$lib/elements/table';
	import { Button } from '$lib/elements/forms';
	import { Pagination } from '$lib/components';
	import Create from './_create.svelte';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getCollections = () => sdkForProject.database.listCollections(search, limit, offset);
	const doSearch = () => {
		offset = 0;
		request = getCollections();
	};
	let request = getCollections();
</script>

<form on:submit|preventDefault={doSearch}>
	<input type="search" bind:value={search} />
</form>

<section>
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
							<a href={`/console/${project}/database/${collection.$id}`}>{collection.$id}</a>
						</TableCell>
						<TableCell>{collection.name}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination
			{limit}
			bind:offset
			sum={response.sum}
			on:change={() => (request = getCollections())}
		/>
	{/await}
</section>

<Button on:click={() => (showCreate = true)}>Upload</Button>
<Create bind:showCreate on:created={() => (request = getCollections())} />
