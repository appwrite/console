<script lang="ts">
	import { page } from '$app/stores';
	import { sdkForProject } from '$lib/stores/sdk';

	const request = sdkForProject.users.get($page.params.user);
</script>

{#await request}
	<div aria-busy="true" />
{:then user}
	<p>Name: {user.name}</p>
	<p>Mail: {user.email}</p>
{/await}
