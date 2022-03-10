<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableRow, TableBody, TableHeader, TableCell } from '$lib/elements/table';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import Create from './_create.svelte';
	import type { Models } from 'src/sdk';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
		showCreate = false;
		await goto(`/console/${project}/storage/bucket/${event.detail.$id}`);
	};

	$: request = sdkForProject.storage.listBuckets(search, limit, offset);
	$: if (search) offset = 0;
</script>

<h1>Buckets</h1>
<Card>
	<InputSearch bind:value={search} />
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
		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Create Bucket</Button>
<Create bind:showCreate on:created={bucketCreated} />
