<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/stores';
	import { addNotification } from '$lib/stores/notifications';
	import { sdkForProject } from '$lib/stores/sdk';
	import { collection } from './store';

	$: project = $page.params.project;
	$: collectionId = $page.params.collection;

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

<nav>
	<ul>
		<li>
			<a href={`/console/${project}/database/${collectionId}`}>Documents</a>
		</li>
		<li>
			<a href={`/console/${project}/database/${collectionId}/attributes`}>Attributes</a>
		</li>
		<li>
			<a href={`/console/${project}/database/${collectionId}/indexes`}>Indexes</a>
		</li>
		<li>
			<a href={`/console/${project}/database/${collectionId}/settings`}>Settings</a>
		</li>
	</ul>
</nav>
{#if $collection}
	<slot />
{:else}
	<div aria-busy="true" />
{/if}
