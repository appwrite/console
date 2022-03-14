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
		TableCellText,
		TableCell
	} from '$lib/elements/table';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination } from '$lib/components';
	import Create from './_create.svelte';
	import { goto } from '$app/navigation';
	import type { Models } from 'src/sdk';
	import { toLocaleDate } from '$lib/helpers/date';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();
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
			<TableCellHead width={30} />
			<TableCellHead>Name</TableCellHead>
			<TableCellHead>Members</TableCellHead>
			<TableCellHead>Created</TableCellHead>
		</TableHeader>
		<TableBody>
			{#each response.teams as team}
				<TableRow>
					<TableCell onlyDesktop>
						<div class="image">
							<img
								class="avatar"
								width="30"
								height="30"
								src={getAvatar(team.name)}
								alt={team.name}
							/>
						</div>
					</TableCell>
					<TableCellLink title="ID" href={`/console/${project}/users/team/${team.$id}`}>
						{team.name}
					</TableCellLink>
					<TableCellText title="Members">{team.total}</TableCellText>
					<TableCellText title="Members">{toLocaleDate(team.dateCreated)}</TableCellText>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination {limit} bind:offset sum={response.total} />
{/await}

<Button>Create Team</Button>
<Create bind:showCreate on:created={teamCreated} />
