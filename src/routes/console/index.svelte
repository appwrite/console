<script lang="ts">
	import { Button } from '$lib/components';
	import { sdkForConsole } from '$lib/stores/sdk';
	import Create from './_create.svelte';

	const request = sdkForConsole.projects.list();

	let addProject = false;
</script>

<h1>Your Projects</h1>

{#await request}
	<div aria-busy="true" />
{:then response}
	{#each response.projects as project}
		<a href={`/console/${project.$id}`}><article>{project.name}</article></a>
	{/each}
	<Button on:click={() => (addProject = true)}>New Project</Button>
{/await}

<Create bind:show={addProject} />
