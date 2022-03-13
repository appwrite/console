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
	const request = sdkForConsole.projects.listWebhooks(projectId);
</script>

<Back href={`/console/${projectId}`}>Home</Back>
<h1>Webhooks</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCellHead width={80}>Name</TableCellHead>
				<TableCellHead>URL</TableCellHead>
				<TableCellHead width={80}>Events</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.webhooks as webhook}
					<TableCellLink href={`/console/${projectId}/webhooks/${webhook.$id}`} title="Name">
						{webhook.name}
					</TableCellLink>
					<TableCellText title="URL">{webhook.url}</TableCellText>
					<TableCellText title="Scopes">{webhook.events.length}</TableCellText>
				{/each}
			</TableBody>
		</Table>
	{/await}
</Card>
