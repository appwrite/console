<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableRow, TableBody, TableHeader, TableCell } from '$lib/elements/table';
	import { Card, Pagination } from '$lib/components';
	import { collection } from './store';

	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getDocuments = () =>
		sdkForProject.database.listDocuments($collection.$id, [], limit, offset);

	const columns = [
		{ key: '$id', title: '#' },
		...$collection.attributes.map((attribute) => ({
			key: attribute.key,
			title: attribute.key
		}))
	];

	let request = getDocuments();
</script>

<h1>Documents</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table horizontalScroll={true}>
			<TableHeader>
				{#each columns as column}
					<TableCell>{column.title}</TableCell>
				{/each}
			</TableHeader>
			<TableBody>
				{#each response.documents as document}
					<TableRow>
						{#each columns as column}
							<TableCell>
								<a href={`/console/${project}/database/${$collection.$id}/${document.$id}`}>
									{document[column.key] ?? 'n/a'}
								</a>
							</TableCell>
						{/each}
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination
			{limit}
			bind:offset
			sum={response.total}
			on:change={() => (request = getDocuments())}
		/>
	{/await}
</Card>
