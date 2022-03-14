<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';
	import type { Models } from 'src/sdk';
	import CreatePlatform from './_createPlatform.svelte';
	import { addNotification } from '$lib/stores/notifications';
	import { Card, List, ListItem } from '$lib/components';

	let range: '24h' | '30d' | '90d' = '30d';
	let addPlatform = false;

	$: requestUsage = sdkForConsole.projects.getUsage($page.params.project, range);

	const getLast = (list: Models.MetricList[]) => list[list.length - 1];
	const deletePlatform = async (id: string) => {
		if (confirm('You sure you wanna delete this?')) {
			try {
				await sdkForConsole.projects.deletePlatform($project.$id, id);
				await project.load($project.$id);
				addNotification({
					message: 'Platform was deleted.',
					type: 'success'
				});
			} catch (error) {
				addNotification({
					message: error.message,
					type: 'error'
				});
			}
		}
	};
</script>

<svelte:head>
	<title>Appwrite - Console</title>
</svelte:head>

{#if $project}
	<h1>{$project.name}</h1>
	<Card>
		<p>imagine here are some cool stats</p>
	</Card>
	<h1>Platforms</h1>
	<List>
		{#each $project.platforms as platform}
			<ListItem avatar={sdkForConsole.avatars.getInitials(platform.type, 60, 60).toString()}>
				<svelte:fragment slot="header">
					<h2 class="sessions-item-title">
						<span class="text">
							{platform.name}
						</span>
					</h2>
				</svelte:fragment>
				<svelte:fragment slot="info">
					{platform.hostname}
				</svelte:fragment>
				<svelte:fragment slot="action">
					<Button danger on:click={() => deletePlatform(platform.$id)}>Delete</Button>
				</svelte:fragment>
			</ListItem>
		{:else}
			<Card>
				<b>No Platforms Added to Your Project</b>
				<p>Add your first platform and build your new application.</p>
			</Card>
		{/each}
		<Button on:click={() => (addPlatform = true)}>Add Platform</Button>
		<CreatePlatform bind:show={addPlatform} />
	</List>
{/if}
