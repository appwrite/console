<script lang="ts">
	import { page } from '$app/stores';
	import { Pagination, Table, TableCell, TableHeader, TableBody, TableRow } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';

	const getSessions = () => sdkForProject.users.getSessions($page.params.user);

	let offset = 0;
	const limit = 25;

	let request = getSessions();
</script>

{#await request}
	<div aria-busy="true" />
{:then response}
	<Table>
		<TableHeader>
			<TableCell>Country</TableCell>
			<TableCell>OS</TableCell>
			<TableCell>IP</TableCell>
		</TableHeader>
		<TableBody>
			{#each response.sessions as session}
				<TableRow>
					<TableCell>{session.countryName}</TableCell>
					<TableCell>{session.osName}</TableCell>
					<TableCell>{session.ip}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination {limit} bind:offset sum={response.sum} on:change={() => (request = getSessions())} />
{/await}
