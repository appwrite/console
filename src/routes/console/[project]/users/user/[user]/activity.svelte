<script lang="ts">
	import { page } from '$app/stores';
	import { Pagination, Table, TableBody, TableHeader, TableRow, TableCell } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';

	const getLogs = () => sdkForProject.users.getLogs($page.params.user);

	let offset = 0;
	const limit = 25;

	let request = getLogs();
</script>

{#await request}
	<div aria-busy="true" />
{:then response}
	<Table>
		<TableHeader>
			<TableCell>Event</TableCell>
			<TableCell>Time</TableCell>
			<TableCell>IP</TableCell>
		</TableHeader>
		<TableBody>
			{#each response.logs as log}
				<TableRow>
					<TableCell>{log.event}</TableCell>
					<TableCell>{log.time}</TableCell>
					<TableCell>{log.ip}</TableCell>
				</TableRow>
			{/each}
		</TableBody>
	</Table>

	<Pagination {limit} bind:offset sum={response.sum} on:change={() => (request = getLogs())} />
{/await}
