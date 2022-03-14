<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
	$: collectionId = $page.params.collection;
	$: path = `/console/${project}/database/collection/${collectionId}`;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a class="tabs-button" href={path} class:is-selected={$page.url.pathname === path}>
			<span class="text">Documents</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/attributes`}
			class:is-selected={$page.url.pathname.startsWith(`${path}/attributes`)}
		>
			<span class="text">Attributes</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/indexes`}
			class:is-selected={$page.url.pathname.startsWith(`${path}/indexes`)}
		>
			<span class="text">Indexes</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/settings`}
			class:is-selected={$page.url.pathname.startsWith(`${path}/settings`)}
		>
			<span class="text">Settings</span>
		</a>
	</li>
</ul>
