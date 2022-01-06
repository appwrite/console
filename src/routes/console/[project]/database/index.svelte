<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, Button, Pagination } from '$lib/components';
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
		<Table
			columns={[
				{ key: '$id', title: 'ID' },
				{ key: 'name', title: 'Name' }
			]}
			data={response.collections}
			anchor={`/console/${project}/database/:$id`}
			anchorReplace={{
				$id: ':$id'
			}}
		/>
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
