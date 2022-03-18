<script lang="ts">
	import { page } from '$app/stores';
	import { Empty, Pagination } from '$lib/components';
	import {
		Table,
		TableBody,
		TableHeader,
		TableRow,
		TableCellHead,
		TableCellText
	} from '$lib/elements/table';
	import { Container } from '$lib/layout';
	import { sdkForProject } from '$lib/stores/sdk';

	let offset = 0;
	const limit = 25;

	$: request = sdkForProject.users.getLogs($page.params.user, limit, offset);
</script>

<Container>
	<h1>Activity</h1>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		{#if response.total}
			<Table>
				<TableHeader>
					<TableCellHead>Date</TableCellHead>
					<TableCellHead>Event</TableCellHead>
					<TableCellHead>Client</TableCellHead>
					<TableCellHead>Location</TableCellHead>
					<TableCellHead>IP</TableCellHead>
				</TableHeader>
				<TableBody>
					{#each response.logs as log}
						<TableRow>
							<TableCellText title="Date">{log.time}</TableCellText>
							<TableCellText title="Event">{log.event}</TableCellText>
							<TableCellText title="Client">
								{log.clientName}
								{log.clientVersion} on {log.osName}
								{log.osVersion}
							</TableCellText>
							<TableCellText title="Location">
								{#if log.countryCode !== '--'}
									<img
										src={sdkForProject.avatars.getFlag(log.countryCode, 32, 32).toString()}
										alt={log.countryName}
									/>{log.countryName}
								{:else}
									Unknown
								{/if}
							</TableCellText>
							<TableCellText title="IP">{log.ip}</TableCellText>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
			<Pagination {limit} bind:offset sum={response.total} />
		{:else}
			<Empty>No activities available.</Empty>
		{/if}
	{/await}
</Container>
