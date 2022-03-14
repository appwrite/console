<script lang="ts">
	import { page } from '$app/stores';
	import { Back, Card } from '$lib/components';
	import {
		Table,
		TableBody,
		TableCellHead,
		TableCellLink,
		TableCellText,
		TableHeader
	} from '$lib/elements/table';
	import { sdkForConsole } from '$lib/stores/sdk';

	const projectId = $page.params.project;
	const request = sdkForConsole.projects.listKeys(projectId);
</script>

<svelte:head>
	<title>Appwrite - API Keys</title>
</svelte:head>
<Back href={`/console/${projectId}`}>Home</Back>
<h1>API Keys</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCellHead>Name</TableCellHead>
				<TableCellHead>Scopes</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.keys as key}
					<TableCellLink href={`/console/${projectId}/keys/${key.$id}`} title="Name"
						>{key.name}</TableCellLink
					>
					<TableCellText title="Scopes">{key.scopes.length}</TableCellText>
				{/each}
			</TableBody>
		</Table>
	{/await}
</Card>
