<script lang="ts">
	import {
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableCellHead,
		TableCellText
	} from '$lib/elements/table';
	import { Button } from '$lib/elements/forms';
	import { DropList, DropListItem, Empty } from '$lib/components';
	import { option, options } from './attributes/store';
	import { collection } from './store';
	import { Container } from '$lib/layout';
	import { Pill } from '$lib/elements';

	let showCreateDropdown = false;
</script>

<Container>
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
						<TableCellText title="Status">
							<Pill
								success={attribute.status === 'available'}
								pending={attribute.status === 'processing'}
								failed={['deleting', 'stuck', 'failed'].includes(attribute.status)}
							>
								{attribute.status}
							</Pill>
						</TableCellText>
						<TableCellText title="Key">{attribute.key}</TableCellText>
						<TableCellText title="Type">
							{'format' in attribute ? attribute.format : attribute.type}
						</TableCellText>
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

	<DropList bind:show={showCreateDropdown}>
		<Button on:click={() => (showCreateDropdown = !showCreateDropdown)}>Create Attribute</Button>
		<svelte:fragment slot="list">
			{#each options as o}
				<DropListItem icon={o.icon} on:click={() => ($option = o)}>
					New {o.name} Attribute
				</DropListItem>
			{/each}
		</svelte:fragment>
	</DropList>
</Container>

{#if $option}
	<svelte:component this={$option.component} on:close={() => ($option = null)} />
{/if}
