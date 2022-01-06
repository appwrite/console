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
		<Table
			columns={[
				{ key: 'name', title: 'Name' },
				{ key: 'email', title: 'E-Mail' }
			]}
			data={response.users}
			anchor={`/console/${project}/users/:$id`}
			anchorReplace={{
				$id: ':$id'
			}}
		/>
		<Pagination {limit} bind:offset sum={response.sum} on:change={() => (request = getUsers())} />
	{/await}
</section>

<Button on:click={() => (showCreate = true)}>Create User</Button>
<Create bind:showCreate on:created={() => (request = getUsers())} />
