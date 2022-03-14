<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import { Table, TableHeader, TableCell, TableBody, TableRow } from '$lib/elements/table';
	import type { Models } from 'src/sdk';
	import Create from './_create.svelte';
	import Update from './_update.svelte';

	let search = '';
	let showCreate = false;
	let showUpdate = false;
	let offset = 0;
	let currentFile: Models.File;

	const limit = 25;
	const bucket = $page.params.bucket;
	const openFile = (file: Models.File) => {
		console.log(file);
		currentFile = file;
		showUpdate = true;
	};

	$: request = sdkForProject.storage.listFiles(bucket, search, limit, offset);
	$: if (search) offset = 0;
</script>

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
				<TableCell>Type</TableCell>
				<TableCell>Size</TableCell>
				<TableCell>Date Created</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.files as file}
					<TableRow>
						<TableCell>
							<span class="link" on:click={() => openFile(file)}>
								{file.$id}
							</span>
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
<Update bind:showUpdate bind:file={currentFile} />
