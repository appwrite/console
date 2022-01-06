<script lang="ts">
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<h1>Users</h1>
<nav>
	<ul>
		<li>
			<a href={`/console/${project}/users`}>Users</a>
		</li>
		<li>
			<a href={`/console/${project}/users/team`}>Teams</a>
		</li>
		<li>
			<a href={`/console/${project}/users/settings`}>Settings</a>
		</li>
		<li>
			<a href={`/console/${project}/users/usage`}>Usage</a>
		</li>
	</ul>
</nav>
<slot />
