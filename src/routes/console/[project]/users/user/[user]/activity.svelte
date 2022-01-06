<script lang="ts">
	import { page } from '$app/stores';
	import { Pagination, Table } from '$lib/components';
	import { sdkForProject } from '$lib/stores/sdk';

	const getLogs = () => sdkForProject.users.getLogs($page.params.user);

	let offset = 0;
	const limit = 25;

let request = getLogs();
</script>

{#await request}
	<div aria-busy="true" />
{:then response}
	<Table
		columns={[
			{ key: 'event', title: 'Event' },
			{ key: 'time', title: 'Time' },
			{ key: 'ip', title: 'IP' }
		]}
		data={response.logs}
	/>
	<Pagination {limit} bind:offset sum={response.sum} on:change={() => (request = getLogs())} />
{/await}
