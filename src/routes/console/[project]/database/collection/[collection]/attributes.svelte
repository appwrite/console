<script lang="ts">
	import { Empty } from '$lib/components';

	import { Button } from '$lib/elements/forms';
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCellHead,
		TableCellText
	} from '$lib/elements/table';
	import Create from './attributes/_create.svelte';
	import { collection } from './store';

	let showCreate = false;
</script>

<h1>Attributes</h1>

{#if $collection.attributes.length}
	<Table>
		<TableHeader>
			<TableCellHead>Status</TableCellHead>
			<TableCellHead>Key</TableCellHead>
			<TableCellHead>Type</TableCellHead>
		</TableHeader>
		<TableBody>
			{#each $collection.attributes as attribute}
				<TableRow>
					<TableCellText title="Status">{attribute.status}</TableCellText>
					<TableCellText title="Key">{attribute.key}</TableCellText>
					<TableCellText title="Type">{attribute.type}</TableCellText>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{:else}
	<Empty>
		<svelte:fragment slot="header">No Attributes Found</svelte:fragment>
		Add your first attribute to get started.
	</Empty>
{/if}

<Button on:click={() => (showCreate = true)}>Create Attribute</Button>
<Create bind:show={showCreate} />
