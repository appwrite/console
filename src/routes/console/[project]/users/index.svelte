<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Card, Empty, Pagination } from '$lib/components';
	import { Button, InputSearch } from '$lib/elements/forms';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCell,
		TableCellHead,
		TableCellLink,
		TableCellText
	} from '$lib/elements/table';
	import Create from './_create.svelte';
	import type { Models } from 'src/sdk';
	import { goto } from '$app/navigation';
	import { Pill } from '$lib/elements';
	import { toLocaleDate } from '$lib/helpers/date';

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
{#await request}
	<div aria-busy="true" />
{:then response}
	{#if response.total}
		<Table>
			<TableHeader>
				<TableCellHead width={30} />
				<TableCellHead>Name</TableCellHead>
				<TableCellHead>E-Mail</TableCellHead>
				<TableCellHead>Status</TableCellHead>
				<TableCellHead>Joined</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.users as user}
					<TableRow>
						<TableCell onlyDesktop>
							<div class="image">
								<img
									class="avatar"
									width="30"
									height="30"
									src={getAvatar(user.name)}
									alt={user.name}
								/>
							</div>
						</TableCell>
						<TableCellLink href={`/console/${project}/users/user/${user.$id}`} title="Name">
							{user.name ? user.name : 'n/a'}
						</TableCellLink>
						<TableCellText title="E-Mail">{user.email}</TableCellText>
						<TableCellText title="Status">
							<Pill success={user.emailVerification}>
								{user.emailVerification ? 'Verified' : 'Unverified'}
							</Pill>
						</TableCellText>
						<TableCellText title="Joined">{toLocaleDate(user.registration)}</TableCellText>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
		<Pagination {limit} bind:offset sum={response.total} />
	{:else if search}
		<Empty>
			<svelte:fragment slot="header">No results found for <b>{search}</b></svelte:fragment>
		</Empty>
	{:else}
		<Empty>
			<svelte:fragment slot="header">No Users Found</svelte:fragment>
			Create your first user to get started.
		</Empty>
	{/if}
{/await}

<Button on:click={() => (showCreate = true)}>Create User</Button>
<Create bind:showCreate on:created={userCreated} />
