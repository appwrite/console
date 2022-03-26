<script>
	import { base } from '$app/paths';

	import { page } from '$app/stores';

	$: project = $page.params.project;
	$: bucketId = $page.params.bucket;
	$: path = `${base}/console/${project}/storage/bucket/${bucketId}`;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a class="tabs-button is-selected" href={path} class:is-selected={$page.url.pathname === path}>
			<span class="text">Files</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/usage`}
			class:is-selected={$page.url.pathname === `${path}/usage`}
		>
			<span class="text">Usage</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/settings`}
			class:is-selected={$page.url.pathname === `${path}/settings`}
		>
			<span class="text">Settings</span>
		</a>
	</li>
</ul>
