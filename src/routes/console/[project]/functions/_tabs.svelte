<script>
	import { base } from '$app/paths';

	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${base}/console/${project}/functions`}
			class:is-selected={$page.url.pathname === `/console/${project}/functions`}
		>
			<span class="text">Functions</span>
		</a>
	</li>
</ul>
