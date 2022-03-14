<script lang="ts">
	import { page } from '$app/stores';

	$: project = $page.params.project;
</script>

<div class="side-nav">
	<div class="side-nav-top">
		<a class="side-nav-logo" href="/console">
			<img
				src="/appwrite-nav.svg"
				loading="lazy"
				alt="Appwrite Logo"
				class="side-nav-logo-image"
				height="26"
			/>
		</a>
	</div>
	{#if project}
		<div class="side-nav-main">
			<a
				class="side-nav-link"
				class:is-selected={$page.url.pathname === `/console/${project}/`}
				href={`/console/${project}`}
			>
				<span class="icon-home" aria-hidden="true" />
				<span class="text">Home</span>
			</a>
			<section class="side-nav-section">
				<h4 class="side-nav-subtitle">Develop</h4>
				<ul class="side-nav-list">
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/database`)}
							href={`/console/${project}/database`}
						>
							<span class="icon-database" aria-hidden="true" />
							<span class="text">Database</span>
						</a>
					</li>
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/storage`)}
							href={`/console/${project}/storage`}
						>
							<span class="icon-folder" aria-hidden="true" />
							<span class="text">Storage</span>
						</a>
					</li>
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/users`)}
							href={`/console/${project}/users`}
						>
							<span class="icon-users" aria-hidden="true" />
							<span class="text">Users</span>
						</a>
					</li>
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/functions`)}
							href={`/console/${project}/functions`}
						>
							<span class="icon-lightning" aria-hidden="true" />
							<span class="text">Functions</span>
						</a>
					</li>
				</ul>
			</section>
			<section class="side-nav-section">
				<h4 class="side-nav-subtitle">Manage</h4>
				<ul class="side-nav-list">
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/webhooks`)}
							href={`/console/${project}/webhooks`}
						>
							<span class="icon-link" aria-hidden="true" />
							<span class="text">Webhooks</span>
						</a>
					</li>
					<li class="side-nav-item">
						<a
							class="side-nav-link"
							class:is-selected={$page.url.pathname.startsWith(`/console/${project}/keys`)}
							href={`/console/${project}/keys`}
						>
							<span class="icon-key-inv" aria-hidden="true" />
							<span class="text">API Keys</span>
						</a>
					</li>
				</ul>
			</section>
		</div>

		<div class="side-nav-bottom">
			<a
				class="side-nav-link"
				href={`/console/${project}/settings`}
				class:is-selected={$page.url.pathname.startsWith(`/console/${project}/settings`)}
			>
				<span class="icon-cog" aria-hidden="true" />
				<span class="text">Settings</span>
			</a>
		</div>
	{/if}
</div>

<style>
	.side-nav {
		z-index: 9999;
	}
</style>
