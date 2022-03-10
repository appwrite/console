<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { sdkForProject } from '$lib/stores/sdk';
	import { Button, InputSearch } from '$lib/elements/forms';
	import { Card, Pagination, Tile, Tiles } from '$lib/components';
	import Create from './_create.svelte';
	import type { Models } from 'src/sdk';

	let search = '';
	let showCreate = false;
	let offset = 0;

	const limit = 25;
	const project = $page.params.project;
	const bucketCreated = async (event: CustomEvent<Models.Bucket>) => {
		showCreate = false;
		await goto(`/console/${project}/storage/bucket/${event.detail.$id}`);
	};

	$: request = sdkForProject.storage.listBuckets(search, limit, offset);
	$: if (search) offset = 0;
</script>

<h1>Buckets</h1>
<Card>
	<InputSearch bind:value={search} />
</Card>

{#await request}
	<div aria-busy="true" />
{:then response}
	<Tiles>
		{#each response.buckets as bucket}
			<Tile href={`/console/${project}/storage/bucket/${bucket.$id}`} title={bucket.name} />
		{/each}
	</Tiles>

	<Pagination {limit} bind:offset sum={response.total} />
{/await}

<Button on:click={() => (showCreate = true)}>Create Bucket</Button>
<Create bind:showCreate on:created={bucketCreated} />
