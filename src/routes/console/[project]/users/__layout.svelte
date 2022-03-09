<script lang="ts">
	import { page } from '$app/stores';
	import Tabs from './_tabs.svelte';

	$: project = $page.params.project;
</script>

{#if !($page.url.pathname.startsWith(`/console/${project}/users/user/`) || $page.url.pathname.startsWith(`/console/${project}/users/team/`))}
	<h1>Users</h1>
	<Tabs />
{/if}

<slot />
