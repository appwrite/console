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

<Back href={`/console/${project}/database`}>Database</Back>

{#if $collection}
	<h1>{$collection.name}</h1>
	<Tabs />
	<slot />
{:else}
	<div aria-busy="true" />
{/if}
