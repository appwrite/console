<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Card, Pagination } from '$lib/components';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Table, TableHeader, TableBody, TableRow, TableCell } from '$lib/elements/table';
	import Create from './_create.svelte';
	import type { Models } from 'src/sdk';
	import { goto } from '$app/navigation';

	let search = '';
	let showCreate = false;
	let offset = 0;
	const limit = 25;

	const project = $page.params.project;
	const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();
	const userCreated = async (event: CustomEvent<Models.User<Record<string, unknown>>>) => {
		await goto(`/console/${project}/users/user/${event.detail.$id}`);
	};
	$: request = sdkForProject.users.list(search, limit, offset, undefined, undefined, 'DESC');
	$: if (search) offset = 0;
</script>

<h1>Users</h1>
<Card>
	<InputSearch bind:value={search} />
</Card>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell width={80} />
				<TableCell>Name</TableCell>
				<TableCell>E-Mail</TableCell>
				<TableCell>Status</TableCell>
				<TableCell>Joined</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.users as user}
					<TableRow>
						<TableCell>
							<img src={getAvatar(user.name)} alt={user.name} />
						</TableCell>
						<TableCell>
							<a href={`/console/${project}/users/user/${user.$id}`}>
								{user.name}
							</a>
						</TableCell>
						<TableCell>{user.email}</TableCell>
						<TableCell>{user.emailVerification}</TableCell>
						<TableCell>{user.registration}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>

<Button on:click={() => (showCreate = true)}>Create User</Button>
<Create bind:showCreate on:created={userCreated} />
