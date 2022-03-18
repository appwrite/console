<script lang="ts">
	import { page } from '$app/stores';
	import { Empty } from '$lib/components';
	import {
		Table,
		TableBody,
		TableCellHead,
		TableCellLink,
		TableCellText,
		TableHeader
	} from '$lib/elements/table';
	import { Container } from '$lib/layout';
	import { sdkForConsole } from '$lib/stores/sdk';

	const projectId = $page.params.project;
	const request = sdkForConsole.projects.listKeys(projectId);
</script>

<svelte:head>
	<title>Appwrite - API Keys</title>
</svelte:head>
<Container>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		{#if response.total}
			<Table>
				<TableHeader>
					<TableCellHead>Name</TableCellHead>
					<TableCellHead>Scopes</TableCellHead>
				</TableHeader>
				<TableBody>
					{#each response.keys as key}
						<TableCellLink href={`/console/${projectId}/keys/key/${key.$id}`} title="Name">
							{key.name}
						</TableCellLink>
						<TableCellText title="Scopes">{key.scopes.length}</TableCellText>
					{/each}
				</TableBody>
			</Table>
		{:else}
			<Empty>
				<svelte:fragment slot="header">No API Keys Found</svelte:fragment>
				You haven't created any API keys for your project yet.
			</Empty>
		{/if}
	{/await}
</Container>
