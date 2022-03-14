<script>
	import { page } from '$app/stores';

	$: path = `/console/${$page.params.project}/settings`;
</script>

<ul class="tabs">
	<li class="tabs-item">
		<a class="tabs-button is-selected" href={path} class:is-selected={$page.url.pathname === path}>
			<span class="text">Overview</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`${path}/services`}
			class:is-selected={$page.url.pathname === `${path}/services`}
		>
			<span class="text">Services</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`${path}/domains`}
			class:is-selected={$page.url.pathname === `${path}/domains`}
		>
			<span class="text">Custom Domains</span>
		</a>
	</li>
	<li class="tabs-item">
		<a
			class="tabs-button is-selected"
			href={`${path}/members`}
			class:is-selected={$page.url.pathname === `${path}/members`}
		>
			<span class="text">Members</span>
		</a>
	</li>
</ul>
