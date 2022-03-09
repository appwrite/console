<script>
	import { page } from '$app/stores';

	$: path = `/console/${$page.params.project}/users/user/${$page.params.user}`;
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
			href={`${path}/sessions`}
			class:is-selected={$page.url.pathname === `${path}/sessions`}
		>
			<span class="text">Sessions</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${path}/activity`}
			class:is-selected={$page.url.pathname === `${path}/activity`}
		>
			<span class="text">Activity</span>
		</a>
	</li>
</ul>
