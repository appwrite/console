<script lang="ts">
	import { page } from '$app/stores';
	import { Back, Card } from '$lib/components';
	import { Pill } from '$lib/elements';
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
	const request = sdkForConsole.projects.listDomains(projectId);
</script>

<svelte:head>
	<title>Appwrite - Domains</title>
</svelte:head>
<Back href={`/console/${projectId}`}>Home</Back>
<h1>API Keys</h1>
<Card>
	{#await request}
		<div aria-busy="true" />
	{:then response}
		<Table>
			<TableHeader>
				<TableCellHead width={80} />
				<TableCellHead>Domain</TableCellHead>
				<TableCellHead>TLS</TableCellHead>
			</TableHeader>
			<TableBody>
				{#each response.domains as domain}
					<TableCellText title="Scopes">
						<Pill failed={!domain.verification} success={domain.verification}>
							{domain.verification ? 'Unverified' : 'Verified'}
						</Pill>
					</TableCellText>
					<TableCellLink href={`/console/${projectId}/keys/${domain.$id}`} title="Domain">
						{domain.domain}
					</TableCellLink>
					<TableCellText title="Scopes">
						{#if domain.certificateId}
							Verified
						{:else if domain.verification}
							In Progress
						{:else}
							Pending Verification
						{/if}
					</TableCellText>
				{/each}
			</TableBody>
		</Table>
	{/await}
</Card>
