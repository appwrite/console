<script lang="ts">
	import { Table, TableCell, TableHeader, TableBody, TableRow, Button } from '$lib/components';
	import Create from './attributes/_create.svelte';
	import { collection } from './store';

	let showCreate = false;
</script>

<section>
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
</section>

<Button on:click={() => (showCreate = true)}>Create Attribute</Button>
<Create bind:show={showCreate} />
