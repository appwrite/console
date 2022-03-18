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
	const request = sdkForConsole.projects.listWebhooks(projectId);
</script>

<svelte:head>
	<title>Appwrite - Webhooks</title>
</svelte:head>
<Container>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		{#if response.total}
			<Table>
				<TableHeader>
					<TableCellHead width={80}>Name</TableCellHead>
					<TableCellHead>URL</TableCellHead>
					<TableCellHead width={80}>Events</TableCellHead>
				</TableHeader>
				<TableBody>
					{#each response.webhooks as webhook}
						<TableCellLink
							title="Name"
							href={`/console/${projectId}/webhooks/webhook/${webhook.$id}`}
						>
							{webhook.name}
						</TableCellLink>
						<TableCellText title="URL">{webhook.url}</TableCellText>
						<TableCellText title="Scopes">{webhook.events.length}</TableCellText>
					{/each}
				</TableBody>
			</Table>
		{:else}
			<Empty>
				<svelte:fragment slot="header">No Webhooks Found</svelte:fragment>
				You haven't created any webhooks for your project yet.
			</Empty>
		{/if}
	{/await}
</Container>
