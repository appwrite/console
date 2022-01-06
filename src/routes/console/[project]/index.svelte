<script lang="ts">
	import { page } from '$app/stores';
	import { Button } from '$lib/components';
	import { sdkForConsole } from '$lib/stores/sdk';
	import type { Models } from 'src/sdk';
	import { project } from './store';

	let range: '24h' | '30d' | '90d' = '30d';
	let requestUsage = sdkForConsole.projects.getUsage($page.params.project, range);

	const getLast = (list: Models.MetricList[]) => list[list.length - 1];
	// const getTotal = (list: Models.MetricList[]) => list.reduce((prev, curr) => curr.value + prev, 0);
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
					<Button>Delete</Button>
				</div>
			</div>
		{/each}
	</article>
{/if}

<style>
	h2 {
		margin-bottom: 0;
	}
</style>
