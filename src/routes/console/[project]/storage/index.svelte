<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableRow, TableBody, TableHeader, TableCell } from '$lib/elements/table';
	import { Button } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import Create from './_create.svelte';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getCollections = () => sdkForProject.storage.listBuckets(search, limit, offset);
	const doSearch = () => {
		offset = 0;
		request = getCollections();
	};
	let request = getCollections();
</script>

<h1>Buckets</h1>
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
				{#each response.buckets as bucket}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/storage/bucket/${bucket.$id}`}>{bucket.$id}</a>
						</TableCell>
						<TableCell>{bucket.name}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination
			{limit}
			bind:offset
			sum={response.total}
			on:change={() => (request = getCollections())}
		/>
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Create Bucket</Button>
<Create bind:showCreate on:created={() => (request = getCollections())} />
