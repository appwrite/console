<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from './store';
	import Tabs from './_tabs.svelte';

	page.subscribe(async (p) => {
		if (browser && p.params.collection) {
			try {
				collection.set(await sdkForProject.database.getCollection(p.params.collection));
			} catch (error) {
				addNotification({
					type: 'error',
					message: error.message
				});
			}
		}
	});
</script>

<Tabs />

{#if $collection}
	<slot />
{:else}
	<div aria-busy="true" />
{/if}
