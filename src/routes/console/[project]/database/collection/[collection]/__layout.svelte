<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { collection } from './store';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
	const collectionId = $page.params.collection;

	$: {
		if (browser) {
			collection.load(collectionId);
		}
	}
</script>

<svelte:head>
	<title>Appwrite - {$collection?.name ?? 'Collection'}</title>
</svelte:head>

{#if $collection}
	{#if !$page.url.pathname.startsWith(`/console/${project}/database/collection/${collectionId}/document`)}
		<Back href={`/console/${project}/database`}>Database</Back>
		<h1>{$collection.name}</h1>
		<Tabs />
	{/if}
	<slot />
{:else}
	<div aria-busy="true" />
{/if}
