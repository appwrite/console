<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, Pagination } from '$lib/components';
	import { collection } from './store';

	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getDocuments = () =>
		sdkForProject.database.listDocuments($collection.$id, [], limit, offset);

	const columns = $collection.attributes.map((attribute) => ({
		key: attribute.key,
		title: attribute.key
	}));

	let request = getDocuments();
</script>

<section>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<figure>
			<Table
				columns={[{ key: '$id', title: '#' }, ...columns]}
				data={response.documents}
				anchor={`/console/${project}/database/${$collection.$id}/:$id`}
				anchorReplace={{
					$id: ':$id'
				}}
			/>
		</figure>
		<Pagination
			{limit}
			bind:offset
			sum={response.sum}
			on:change={() => (request = getDocuments())}
		/>
	{/await}
</section>
