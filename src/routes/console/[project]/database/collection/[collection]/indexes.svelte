<script lang="ts">
	import { Empty } from '$lib/components';

	import { Pill } from '$lib/elements';
	import { Button } from '$lib/elements/forms';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCellHead,
		TableCellText
	} from '$lib/elements/table';
	import { collection } from './store';

	let showCreate = false;
</script>

<h1>Indexes</h1>

{#if $collection.indexes.length}
	<Table>
		<TableHeader>
			<TableCellHead>Status</TableCellHead>
			<TableCellHead>Key</TableCellHead>
			<TableCellHead>Type</TableCellHead>
			<TableCellHead>Attributes</TableCellHead>
			<TableCellHead />
		</TableHeader>
		<TableBody>
			{#each $collection.indexes as index}
				<TableRow>
					<TableCellText title="Status">{index.status}</TableCellText>
					<TableCellText title="Key">{index.key}</TableCellText>
					<TableCellText title="Type">{index.type}</TableCellText>
					<TableCellText title="Attributes">
						{#each index.attributes as attribute, i}
							<Pill>{attribute} ({index.orders[i]})</Pill>
						{/each}
					</TableCellText>
					<TableCellText title="Action"><Pill failed>Delete</Pill></TableCellText>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<Empty>
		<svelte:fragment slot="header">No Indexes Found</svelte:fragment>
		Add your first index to get started.
	</Empty>
{/if}
