<script>
	import { base } from '$app/paths';

	import { page } from '$app/stores';

	$: project = $page.params.project;
	$: collectionId = $page.params.collection;
	$: documentId = $page.params.document;
	$: path = `${base}/console/${project}/database/collection/${collectionId}/document/${documentId}`;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a class="tabs-button" href={path} class:is-selected={$page.url.pathname === path}>
			<span class="text">Overview</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/activity`}
			class:is-selected={$page.url.pathname.startsWith(`${path}/activity`)}
		>
			<span class="text">Activity</span>
		</a>
	</li>
</ul>
