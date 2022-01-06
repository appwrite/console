<script lang="ts">
	import { page } from '$app/stores';

	$: path = `/console/${$page.params.project}/users/user/${$page.params.user}`;
</script>

<div class="grid">
	<aside>
		<nav>
			<ul>
				<li><a href={path}>Overview</a></li>
				<li><a href={`${path}/sessions`}>Sessions</a></li>
				<li><a href={`${path}/activity`}>Activity</a></li>
			</ul>
		</nav>
	</aside>
	<div>
		<slot />
	</div>
</div>

<style>
	.grid {
		grid-template-columns: 1fr 3fr;
	}
</style>
