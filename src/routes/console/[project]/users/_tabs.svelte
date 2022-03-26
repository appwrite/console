<script>
	import { base } from '$app/paths';

	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${base}/console/${project}/users`}
			class:is-selected={$page.url.pathname === `${base}/console/${project}/users`}
		>
			<span class="text">Users</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${base}/console/${project}/users/teams`}
			class:is-selected={$page.url.pathname === `${base}/console/${project}/users/teams`}
		>
			<span class="text">Teams</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${base}/console/${project}/users/usage`}
			class:is-selected={$page.url.pathname === `${base}/console/${project}/users/usage`}
		>
			<span class="text">Usage</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`${base}/console/${project}/users/settings`}
			class:is-selected={$page.url.pathname === `${base}/console/${project}/users/settings`}
		>
			<span class="text">Settings</span>
		</a>
	</li>
</ul>
