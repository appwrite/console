<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import {
		Table,
		Button,
		Pagination,
		TableHeader,
		TableBody,
		TableRow,
		TableCell
	} from '$lib/components';
	import Create from './_create.svelte';
	import { user } from '$lib/stores/user';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getUsers = () => sdkForProject.users.list(search, limit, offset);
	const doSearch = () => {
		offset = 0;
		request = getUsers();
	};
	let request = getUsers();
</script>

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
				<TableCell>E-Mail</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.users as user}
					<TableRow>
						<TableCell>
							<a href={`/console/${project}/users/user/${user.$id}`}>
								{user.$id}
							</a>
						</TableCell>
						<TableCell>{user.name}</TableCell>
						<TableCell>{user.email}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {limit} bind:offset sum={response.sum} on:change={() => (request = getUsers())} />
	{/await}
</section>

<Button on:click={() => (showCreate = true)}>Create User</Button>
<Create bind:showCreate on:created={() => (request = getUsers())} />
