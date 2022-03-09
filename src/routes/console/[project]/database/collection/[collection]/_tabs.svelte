<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
	$: collectionId = $page.params.collection;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/database/collection/${collectionId}`}
			class:is-selected={$page.url.pathname ===
				`/console/${project}/database/collection/${collectionId}`}
		>
			<span class="text">Documents</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/database/collection/${collectionId}/attributes`}
			class:is-selected={$page.url.pathname.startsWith(
				`/console/${project}/database/collection/${collectionId}/attributes`
			)}
		>
			<span class="text">Attributes</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/database/collection/${collectionId}/indexes`}
			class:is-selected={$page.url.pathname.startsWith(
				`/console/${project}/database/collection/${collectionId}/indexes`
			)}
		>
			<span class="text">Indexes</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/database/collection/${collectionId}/settings`}
			class:is-selected={$page.url.pathname.startsWith(
				`/console/${project}/database/collection/${collectionId}/settings`
			)}
		>
			<span class="text">Settings</span>
		</a>
	</li>
</ul>
