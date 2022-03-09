<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import { Table, TableHeader, TableCell, TableBody, TableRow } from '$lib/elements/table';
	import Create from './_create.svelte';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const bucket = $page.params.bucket;
	const doSearch = () => {
		offset = 0;
	};

	$: request = sdkForProject.storage.listFiles(bucket, search, limit, offset);
</script>

<form on:submit|preventDefault={doSearch}>
	<input type="search" bind:value={search} />
</form>

<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>#</TableCell>
				<TableCell>Type</TableCell>
				<TableCell>Size</TableCell>
				<TableCell>Date Created</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.files as file}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/storage/bucket/${bucket}/${file.$id}`}>
								{file.$id}
							</a>
						</TableCell>
						<TableCell>{file.mimeType}</TableCell>
						<TableCell>{file.sizeOriginal}</TableCell>
						<TableCell>{file.dateCreated}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Upload</Button>
<Create bind:showCreate />
