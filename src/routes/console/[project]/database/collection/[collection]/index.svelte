<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import {
		Table,
		TableRow,
		TableBody,
		TableHeader,
		TableCellHead,
		TableCellLink
	} from '$lib/elements/table';
	import { Empty, Pagination } from '$lib/components';
	import { collection } from './store';
	import { Container } from '$lib/layout';

	let offset = 0;

	const limit = 12;
	const project = $page.params.project;

	$: request = sdkForProject.database.listDocuments($collection.$id, [], limit, offset);
	$: columns = [
		{ key: '$id', title: 'ID' },
		...$collection.attributes.map((attribute) => ({
			key: attribute.key,
			title: attribute.key
		}))
	];
</script>

<Container>
	<h1>Documents</h1>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		{#if response.total}
			<Table>
				<TableHeader>
					{#each columns as column}
						<TableCellHead>{column.title}</TableCellHead>
					{/each}
				</TableHeader>
				<TableBody>
					{#each response.documents as document}
						<TableRow>
							{#each columns as column}
								<TableCellLink
									href={`/console/${project}/database/collection/${$collection.$id}/document/${document.$id}`}
									title={column.title}
								>
									{document[column.key] ?? 'n/a'}
								</TableCellLink>
							{/each}
						</TableRow>
					{/each}
				</TableBody>
			</Table>

			<Pagination {limit} bind:offset sum={response.total} />
		{:else}
			<Empty>
				<svelte:fragment slot="header">No Documents Found</svelte:fragment>
				Add your first document to get started.
			</Empty>
		{/if}
	{/await}
</Container>
