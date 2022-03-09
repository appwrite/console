<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import { Table, TableHeader, TableCell, TableBody, TableRow } from '$lib/elements/table';
	import Create from './_create.svelte';
	import { func } from './store';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const functionId = $page.params.function;
	// const doSearch = () => {
	// 	offset = 0;
	// 	request = getDeployments();
	// };
	$: request = sdkForProject.functions.listDeployments(functionId, search, limit, offset);
</script>

<h1>Overview</h1>

<Card>
	<p><b>Function ID:</b> {$func.$id}</p>
	<p><b>Runtime:</b> {$func.runtime}</p>
	<p><b>Last Updated:</b> {$func.dateUpdated}</p>
	<p><b>Created:</b> {$func.dateCreated}</p>
</Card>

<h1>Deployments</h1>

<!-- <Card>
<form on:submit|preventDefault={doSearch}>
	<input type="search" bind:value={search} />
</form>
</Card> -->

<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>#</TableCell>
				<TableCell>Active</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.deployments as deployment}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/storage/bucket/${functionId}/${deployment.$id}`}>
								{deployment.$id}
							</a>
						</TableCell>
						<TableCell>{deployment.activate}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Upload</Button>
<Create bind:showCreate />
