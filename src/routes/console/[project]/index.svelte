<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';
	import type { Models } from 'src/sdk';
	import CreatePlatform from './_createPlatform.svelte';
	import { addNotification } from '$lib/stores/notifications';
	import { Card } from '$lib/components';

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
		<button on:click={() => (range = '30d')}>30d</button>
		<button on:click={() => (range = '90d')}>90d</button>
		{#await requestUsage}
			<div aria-busy="true" />
		{:then usage}
			<div class="grid">
				<div>
					<h2>{getLast(usage.users)}</h2>
					<small>Users</small>
				</div>
				<div>
					<h2>{getLast(usage.documents)}</h2>
					<small>Documents</small>
				</div>
				<div>
					<h2>{getLast(usage.functions)}</h2>
					<small>Executions</small>
				</div>
				<div>
					<h2>{getLast(usage.storage)}</h2>
					<small>Storage</small>
				</div>
			</div>
		{/await}
	</Card>
	<h1>Platforms</h1>
	<Card>
		<article>
			{#each $project.platforms as platform}
				<div class="grid">
					<div>
						{platform.type}
					</div>
					<div>
						<p>
							{platform.name}
							<br />
							<small>{platform.hostname}</small>
						</p>
					</div>
					<div />
					<div>
						<Button secondary>Update</Button>
					</div>
					<div>
						<Button on:click={() => deletePlatform(platform.$id)}>Delete</Button>
					</div>
				</div>
			{:else}
				<div class="grid">
					<div>
						<h4>No Platforms Added to Your Project</h4>
						<p>Add your first platform and build your new application.</p>
					</div>
				</div>
			{/each}
		</article>
		<Button on:click={() => (addPlatform = true)}>Add Platform</Button>
		<CreatePlatform bind:show={addPlatform} />
	</Card>
{/if}

<style>
	h2 {
		margin-bottom: 0;
	}
</style>
