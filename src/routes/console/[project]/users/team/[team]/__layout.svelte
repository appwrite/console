<script lang="ts">
	import { page } from '$app/stores';

	import { Back } from '$lib/components';

	const project = $page.params.project;
</script>

<svelte:head>
	<title>Appwrite - Team</title>
</svelte:head>
<Back href={`/console/${project}/users`}>Users</Back>

<slot />
