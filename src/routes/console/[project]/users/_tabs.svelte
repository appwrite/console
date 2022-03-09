<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/users/`}
			class:is-selected={$page.url.pathname === `/console/${project}/users/`}
		>
			<span class="text">Users</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/users/team/`}
			class:is-selected={$page.url.pathname === `/console/${project}/users/team/`}
		>
			<span class="text">Teams</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/users/settings/`}
			class:is-selected={$page.url.pathname === `/console/${project}/users/settings/`}
		>
			<span class="text">Settings</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button"
			href={`/console/${project}/users/usage/`}
			class:is-selected={$page.url.pathname === `/console/${project}/users/usage/`}
		>
			<span class="text">Usage</span>
		</a>
	</li>
</ul>
