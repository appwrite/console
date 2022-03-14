<script lang="ts">
	import { List, ListItem } from '$lib/components';
	import { Pill } from '$lib/elements';
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from '../store';

	$: request = sdkForConsole.teams.getMemberships($project?.teamId ?? undefined);
</script>

<h1>Members</h1>
{#await request}
	<div aria-busy="true" />
{:then response}
	{#if response}
		<List>
			{#each response.memberships as membership}
				<ListItem avatar={sdkForConsole.avatars.getInitials(membership.name, 64, 64).toString()}>
					<svelte:fragment slot="header">
						<h2 class="sessions-item-title">
							<span class="text">
								{membership.name}
							</span>
						</h2>
						{#each membership.roles as role}
							<Pill>{role}</Pill>
						{/each}
						{#if !membership.confirm}
							<Pill failed>Pending Approval</Pill>
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="info">
						{membership.email}
					</svelte:fragment>
					<svelte:fragment slot="action">
						<Button danger>Remove</Button>
					</svelte:fragment>
				</ListItem>
			{:else}
				<p>No sessions available.</p>
			{/each}
		</List>
	{/if}
{/await}
