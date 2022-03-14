<script lang="ts">
	import {
		Table,
		TableBody,
		TableCellHead,
		TableCellText,
		TableHeader,
		TableRow
	} from '$lib/elements/table';

	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from '../store';

	$: request = sdkForConsole.teams.getMemberships($project?.teamId ?? undefined);
</script>

<h1>Members</h1>
{#await request}
	<div aria-busy="true" />
{:then response}
	{#if response}
		<Table>
			<TableHeader>
				<TableCellHead>Name</TableCellHead>
				<TableCellHead>Email</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.memberships as membership}
					<TableRow>
						<TableCellText title="Name">
							{membership.name}
						</TableCellText>
						<TableCellText title="Email">
							{membership.email}
						</TableCellText>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
{/await}
