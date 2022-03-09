<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { Back } from '$lib/components';
	import { bucket } from './store';
	import Tabs from './_tabs.svelte';

	const project = $page.params.project;
	const bucketId = $page.params.bucket;

	$: {
		if (browser) {
			bucket.load(bucketId);
		}
	}
</script>

<Back href={`/console/${project}/storage`}>Storage</Back>
{#if $bucket}
	<h1>{$bucket.name}</h1>
	<Tabs />

	<slot />
{/if}
