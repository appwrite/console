<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/storage`}
			class:is-selected={$page.url.pathname === `/console/${project}/storage`}
		>
			<span class="text">Buckets</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/storage/usage`}
			class:is-selected={$page.url.pathname === `/console/${project}/storage/usage`}
		>
			<span class="text">Usage</span>
		</a>
	</li>
</ul>
