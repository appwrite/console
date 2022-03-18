<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Card } from '$lib/components';
	import { Button } from '$lib/elements/forms';
	import { sdkForProject } from '$lib/stores/sdk';

	const request = Promise.all([
		sdkForProject.teams.get($page.params.team),
		sdkForProject.teams.getMemberships($page.params.team)
	]);

	const deleteTeam = async (id: string) => {
		try {
			if (!confirm('Are you sure you want to delete that team?')) return;
			await sdkForProject.teams.delete(id);
			await goto(`/console/${$page.params.project}/teams`);
		} catch (error) {
			console.error(error);
		}
	};

	const deleteMembership = async (id: string) => {
		try {
			if (!confirm('Are you sure you want to delete that membership?')) return;
			await sdkForProject.teams.deleteMembership($page.params.team, id);
		} catch (error) {
			console.error(error);
		}
	};
</script>

{#await request}
	<div aria-busy="true" />
{:then [team, members]}
	<h1>Overview</h1>
	<Card>
		<p>{team.$id}</p>
		<p>Created {team.dateCreated}</p>
	</Card>

	<h1>Members</h1>
	<Card>
		{#each members.memberships as membership}
			<p>
				{membership.name}
				{membership.email}
				<Button on:click={() => deleteMembership(membership.$id)}>Remove</Button>
			</p>
			<p>
				Roles: {membership.roles.join(', ')}
			</p>
		{:else}
			No members found.
		{/each}
	</Card>

	<Button on:click={() => deleteTeam(team.$id)}>Delete Team</Button>
{/await}
