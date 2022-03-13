<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCellHead,
		TableCellLink,
		TableCellText,
		TableCellAvatar
	} from '$lib/elements/table';
	import Create from './_create.svelte';
	import { toLocaleDate } from '$lib/helpers/date';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const bucket = $page.params.bucket;
	const getPreview = (fileId: string) =>
		sdkForProject.storage.getFilePreview(bucket, fileId, 30, 30).toString() + '&mode=admin';

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
				<TableCellHead width={30} />
				<TableCellHead>Name</TableCellHead>
				<TableCellHead>Type</TableCellHead>
				<TableCellHead>Size</TableCellHead>
				<TableCellHead>Date Created</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.files as file}
					<TableRow>
						<TableCellAvatar src={getPreview(file.$id)} alt={file.name} onlyDesktop />
						<TableCellLink
							title="ID"
							href={`/console/${project}/storage/bucket/${bucket}/file/${file.$id}`}
						>
							{file.name}
						</TableCellLink>
						<TableCellText title="Type">{file.mimeType}</TableCellText>
						<TableCellText title="Size">{file.sizeOriginal}</TableCellText>
						<TableCellText title="Date Created">{toLocaleDate(file.dateCreated)}</TableCellText>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Upload</Button>
<Create bind:showCreate />
