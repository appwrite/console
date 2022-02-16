<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';
	import type { Models } from 'src/sdk';
	import CreatePlatform from './_createPlatform.svelte';
	import { addNotification } from '$lib/stores/notifications';

	let range: '24h' | '30d' | '90d' = '30d';
	let requestUsage = sdkForConsole.projects.getUsage($page.params.project, range);
	let addPlatform = false;

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

<article>
	{#await requestUsage}
		<div aria-busy="true" />
	{:then usage}
		<div class="grid">
			<div>
				<h2>{getLast(usage.users).value}</h2>
				<small>Users</small>
			</div>
			<div>
				<h2>{getLast(usage.documents).value}</h2>
				<small>Documents</small>
			</div>
			<div>
				<h2>{getLast(usage.functions).value}</h2>
				<small>Executions</small>
			</div>
			<div>
				<h2>{getLast(usage.storage).value}</h2>
				<small>Storage</small>
			</div>
		</div>
	{/await}
</article>

{#if $project}
	<h2>Platforms</h2>
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
{/if}

<style>
	h2 {
		margin-bottom: 0;
	}
</style>
