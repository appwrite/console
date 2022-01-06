<script lang="ts">
	import { Table, Button } from '$lib/components';
	import Create from './attributes/_create.svelte';
	import { collection } from './store';

	let showCreate = false;
</script>

<section>
	<Table
		columns={[
			{ key: 'status', title: 'Status' },
			{ key: 'key', title: 'Key' },
			{ key: 'type', title: 'Type' }
		]}
		data={$collection.attributes}
	/>
</section>

<Button on:click={() => (showCreate = true)}>Create Attribute</Button>
<Create bind:show={showCreate} />
