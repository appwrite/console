<script lang="ts">
	import { Button } from '$lib/elements/forms';
	import { Table, TableCell, TableHeader, TableBody, TableRow } from '$lib/elements/table';
	import Create from './attributes/_create.svelte';
	import { collection } from './store';

	let showCreate = false;
</script>

<h1>Attributes</h1>

<Table>
	<TableHeader>
		<TableCell>Status</TableCell>
		<TableCell>Key</TableCell>
		<TableCell>Type</TableCell>
	</TableHeader>
	<TableBody>
		{#each $collection.attributes as attribute}
			<TableRow>
				<TableCell>{attribute.status}</TableCell>
				<TableCell>{attribute.key}</TableCell>
				<TableCell>{attribute.type}</TableCell>
			</TableRow>
		{/each}
	</TableBody>
</Table>

<Button on:click={() => (showCreate = true)}>Create Attribute</Button>
<Create bind:show={showCreate} />
