<script lang="ts">
	import { page } from '$app/stores';
	import { Empty } from '$lib/components';
	import { Button } from '$lib/elements/forms';
	import {
		Table,
		TableBody,
		TableCellHead,
		TableCellLink,
		TableCellText,
		TableHeader,
		TableRow
	} from '$lib/elements/table';
	import { Container } from '$lib/layout';
	import { project } from '../store';
	import Create from './_create.svelte';

	const projectId = $page.params.project;

	let showCreate = false;
</script>

<svelte:head>
	<title>Appwrite - API Keys</title>
</svelte:head>
<Container>
	{#if $project}
		{#if $project.keys}
			<Table>
				<TableHeader>
					<TableCellHead>Name</TableCellHead>
					<TableCellHead>Scopes</TableCellHead>
				</TableHeader>
				<TableBody>
					{#each $project.keys as key}
						<TableRow>
							<TableCellLink href={`/console/${projectId}/keys/key/${key.$id}`} title="Name">
								{key.name}
							</TableCellLink>
							<TableCellText title="Scopes">{key.scopes.length}</TableCellText>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{:else}
			<Empty>
				<svelte:fragment slot="header">No API Keys Found</svelte:fragment>
				You haven't created any API keys for your project yet.
			</Empty>
		{/if}
		<Button on:click={() => (showCreate = true)}>Add API Key</Button>
	{/if}
</Container>
<Create bind:show={showCreate} />
