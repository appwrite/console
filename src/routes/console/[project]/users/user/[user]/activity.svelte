<script lang="ts">
	import { page } from '$app/stores';
	import { Card, Pagination } from '$lib/components';
	import { Table, TableBody, TableHeader, TableRow, TableCell } from '$lib/elements/table';
	import { sdkForProject } from '$lib/stores/sdk';

	let offset = 0;
	const limit = 25;

	$: request = sdkForProject.users.getLogs($page.params.user, limit, offset);
</script>

<h1>Activity</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCell>Date</TableCell>
				<TableCell>Event</TableCell>
				<TableCell>Client</TableCell>
				<TableCell>Location</TableCell>
				<TableCell>IP</TableCell>
			</TableHeader>
			<TableBody>
				{#each response.logs as log}
					<TableRow>
						<TableCell>{log.time}</TableCell>
						<TableCell>{log.event}</TableCell>
						<TableCell
							>{log.clientName} {log.clientVersion} on {log.osName} {log.osVersion}</TableCell
						>
						<TableCell>
							{#if log.countryCode !== '--'}
								<img
									src={sdkForProject.avatars.getFlag(log.countryCode, 32, 32).toString()}
									alt={log.countryName}
								/>{log.countryName}
							{:else}
								Unknown
							{/if}
						</TableCell>
						<TableCell>{log.ip}</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>

		<Pagination {limit} bind:offset sum={response.total} />
	{/await}
</Card>
