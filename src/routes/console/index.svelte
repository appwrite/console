<script lang="ts">
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import type { Models } from 'src/sdk';
	import CreateOrganization from './_createOrganization.svelte';
	import CreateProject from './_createProject.svelte';

	type Organization = Models.Team & {
		projects: Models.Project[];
	};

	const request: Promise<Organization[]> = Promise.all([
		sdkForConsole.projects.list(),
		sdkForConsole.teams.list()
	]).then(([{ projects }, { teams }]) => {
		return teams.map((team) => {
			return {
				...team,
				projects: projects.filter((a) => a.teamId === team.$id)
			};
		});
	});

	let addProject = false;
	let addOrganization = false;
	let currentOrganization = '';

	const createProject = (teamId: string) => {
		currentOrganization = teamId;
		addProject = true;
	};
</script>

<h1>Your Organizations</h1>

{#await request}
	<div aria-busy="true" />
{:then organizations}
	{#each organizations as organization}
		<h2>{organization.name}</h2>
		{#each organization.projects as project}
			<a href={`/console/${project.$id}`}><article>{project.name}</article></a>
		{/each}
		<article class="new-project" on:click={() => createProject(organization.$id)}>
			New Project
		</article>
	{/each}
	<Button on:click={() => (addOrganization = true)}>Add Organization</Button>
{/await}

<CreateOrganization bind:show={addOrganization} />
<CreateProject bind:show={addProject} bind:teamId={currentOrganization} />

<style>
	article.new-project {
		cursor: pointer;
	}
</style>
