<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination, Tile, Tiles } from '$lib/components';
	import Create from './_create.svelte';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;

	$: request = sdkForProject.functions.list(search, limit, offset);
	$: if (search) offset = 0;
</script>

<h1>Functions</h1>
<Card>
	<InputSearch bind:value={search} />
</Card>

{#await request}
	<div aria-busy="true" />
{:then response}
	{#each response.functions as func}
		<Tiles>
			<Tile href={`/console/${project}/functions/function/${func.$id}`} title={func.name} />
		</Tiles>
	{/each}

	<Pagination {limit} bind:offset sum={response.total} />
{/await}

<Button on:click={() => (showCreate = true)}>Create Function</Button>
<Create bind:showCreate />
