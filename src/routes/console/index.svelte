<script lang="ts">
	import { goto } from '$app/navigation';
	import { Tiles, Tile } from '$lib/components';
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
	const projectCreated = async (event: CustomEvent<Models.Project>) => {
		await goto(`/console/${event.detail.$id}`);
	};
</script>

<h1>Your Organizations</h1>
<Button on:click={() => (addOrganization = true)}>Add Organization</Button>

{#await request}
	<div aria-busy="true" />
{:then organizations}
	{#each organizations as organization}
		<h1>{organization.name}</h1>
		<Tiles>
			{#each organization.projects as project}
				<Tile href={`/console/${project.$id}`} title={project.name} />
			{/each}
		</Tiles>
		<Button on:click={() => createProject(organization.$id)}>Create Project</Button>
	{/each}
{/await}

<CreateOrganization bind:show={addOrganization} />
<CreateProject
	bind:show={addProject}
	bind:teamId={currentOrganization}
	on:created={projectCreated}
/>
