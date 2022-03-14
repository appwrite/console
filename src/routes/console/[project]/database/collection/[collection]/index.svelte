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
	import { Card, Pagination } from '$lib/components';
	import { collection } from './store';

	let offset = 0;

	const limit = 25;
	const project = $page.params.project;

	$: columns = [
		{ key: '$id', title: '#' },
		...$collection.attributes.map((attribute) => ({
			key: attribute.key,
			title: attribute.key
		}))
	];

	$: request = sdkForProject.database.listDocuments($collection.$id, [], limit, offset);
</script>

<h1>Documents</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
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
								href={`/console/${project}/database/${$collection.$id}/document/${document.$id}`}
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
	{/await}
</Card>
