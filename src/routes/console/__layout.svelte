<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { user } from '$lib/stores/user';
	import { onMount } from 'svelte';

	$: project = $page.params.project;

	onMount(async () => {
		try {
			if (!$user) {
				user.set(await sdkForConsole.account.get());
			}
		} catch (error) {
			await goto('/login');
		}
	});
</script>

<nav>
	<ul>
		<li>
			<a href="/console">Appwrite</a>
		</li>
		{#if project}
			<li>
				<a href={`/console/${project}`}>Home</a>
			</li>
			<li>
				<a href={`/console/${project}/users`}>Users</a>
			</li>
			<li>
				<a href={`/console/${project}/database`}>Database</a>
			</li>
			<li>
				<a href={`/console/${project}/storage`}>Storage</a>
			</li>
		{/if}
	</ul>
	{#if $user}
		<ul>
			<li><a href="/console/@me">{$user.name}</a></li>
		</ul>
	{/if}
</nav>

<slot />
