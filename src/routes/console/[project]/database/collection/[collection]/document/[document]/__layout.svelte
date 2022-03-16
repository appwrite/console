<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { collection } from '../../store';
	import { doc } from './store';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
	const collectionId = $page.params.collection;
	const documentId = $page.params.document;

	$: {
		if (browser) {
			doc.load(collectionId, documentId);
		}
	}
</script>

<svelte:head>
	<title>Appwrite - Database Document</title>
</svelte:head>

{#if $doc && $collection}
	<Back href={`/console/${project}/database/collection/${collectionId}`}>
		Collection - {$collection.name}
	</Back>
	<h1>{$doc.$id}</h1>
	<Tabs />
	<slot />
{:else}
	<div aria-busy="true" />
{/if}
