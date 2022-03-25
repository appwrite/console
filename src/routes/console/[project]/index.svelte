<script lang="ts">
	import { Button } from '$lib/elements/forms';
	import { sdkForConsole } from '$lib/stores/sdk';
	import { project } from './store';
	import { Card, List, ListItem } from '$lib/components';
	import { Cover, Container } from '$lib/layout';
	import CreatePlatform from './_createPlatform.svelte';
	import { Line } from '$lib/charts';

	let addPlatform = false;
</script>

<svelte:head>
	<title>Appwrite - Console</title>
</svelte:head>

{#if $project}
	<Cover>
		<svelte:fragment slot="title">{$project.name}</svelte:fragment>
		<ul class="links-nav">
			<li class="links-nav-item">
				<a class="link" href={`/console/${$project.$id}/settings`}>
					<span class="icon-search" aria-hidden="true" />
					<span class="text">Settings</span>
				</a>
			</li>
			<li class="links-nav-item">
				<a class="link" href={`/console/${$project.$id}/keys`}>
					<span class="icon-search" aria-hidden="true" />
					<span class="text">API Keys</span>
				</a>
			</li>
			<li class="links-nav-item">
				<a class="link" href={`/console/${$project.$id}/webhooks`}>
					<span class="icon-search" aria-hidden="true" />
					<span class="text">Webhooks</span>
				</a>
			</li>
		</ul>
	</Cover>
	<Container>
		<Card>
			<Line />
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
						<Button>Manage</Button>
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
	</Container>
{/if}
