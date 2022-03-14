<script>
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/settings`}
			class:is-selected={$page.url.pathname === `/console/${project}/settings/`}
		>
			<span class="text">Overview</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/settings/services`}
			class:is-selected={$page.url.pathname === `/console/${project}/settings/services/`}
		>
			<span class="text">Services</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/settings/domains`}
			class:is-selected={$page.url.pathname === `/console/${project}/settings/domains/`}
		>
			<span class="text">Custom Domains</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`/console/${project}/settings/members`}
			class:is-selected={$page.url.pathname === `/console/${project}/settings/members/`}
		>
			<span class="text">Members</span>
		</a>
	</li>
</ul>
