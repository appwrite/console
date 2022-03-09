<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Table, TableHeader, TableCell, TableBody, TableRow } from '$lib/elements/table';
	import { Button } from '$lib/elements/forms';
	import { Pagination } from '$lib/components';
	import Create from './_create.svelte';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getTeams = () => sdkForProject.teams.list(search, limit, offset);
	const doSearch = () => {
		offset = 0;
		request = getTeams();
	};
	let request = getTeams();
</script>

<h1>Teams</h1>
<form on:submit|preventDefault={doSearch}>
	<input type="search" bind:value={search} />
</form>
<section>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>#</TableCell>
				<TableCell>Name</TableCell>
				<TableCell>Members</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.teams as team}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/users/team/${team.$id}`}>
								{team.$id}
							</a>
						</TableCell>
						<TableCell>{team.name}</TableCell>
						<TableCell>{team.total}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {limit} bind:offset sum={response.total} on:change={() => (request = getTeams())} />
	{/await}
</section>

<Button on:click={() => (showCreate = true)}>Create Team</Button>
<Create bind:showCreate on:created={() => (request = getTeams())} />
