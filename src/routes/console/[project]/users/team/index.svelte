<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCellHead,
		TableCellLink,
		TableCellText
	} from '$lib/elements/table';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import Create from './_create.svelte';
	import { goto } from '$app/navigation';
	import type { Models } from 'src/sdk';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const teamCreated = async (event: CustomEvent<Models.Team>) => {
		await goto(`/console/${project}/users/team/${event.detail.$id}`);
	};
	$: request = sdkForProject.teams.list(search, limit, offset);
	$: if (search) offset = 0;
</script>

<h1>Teams</h1>
<Card>
	<InputSearch bind:value={search} />
</Card>

{#await request}
	<div aria-busy="true" />
{:then response}
	<Table>
		<TableHeader>
			<TableCellHead>#</TableCellHead>
			<TableCellHead>Name</TableCellHead>
			<TableCellHead>Members</TableCellHead>
		</TableHeader>
		<TableBody>
			{#each response.teams as team}
				<TableRow>
					<TableCellLink title="ID" href={`/console/${project}/users/team/${team.$id}`}>
						{team.$id}
					</TableCellLink>
					<TableCellText title="Name">{team.name}</TableCellText>
					<TableCellText title="Members">{team.total}</TableCellText>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination {limit} bind:offset sum={response.total} />
{/await}

<Button>Create Team</Button>
<Create bind:showCreate on:created={teamCreated} />
