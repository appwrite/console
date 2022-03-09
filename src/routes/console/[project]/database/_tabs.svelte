<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/database`}
			class:is-selected={$page.url.pathname === `/console/${project}/database`}
		>
			<span class="text">Collections</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/database/@usage`}
			class:is-selected={$page.url.pathname === `/console/${project}/database/@usage`}
		>
			<span class="text">Usage</span>
		</a>
	</li>
</ul>
