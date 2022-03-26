<script>
	import { base } from '$app/paths';

	import { page } from '$app/stores';

	$: path = `${base}/console/${$page.params.project}/users/team/${$page.params.team}`;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a class="tabs-button" href={path} class:is-selected={$page.url.pathname === path}>
			<span class="text">Overview</span>
		</a>
	</li>
</ul>
