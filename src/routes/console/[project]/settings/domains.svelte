<script lang="ts">
	import { page } from '$app/stores';
	import { Pill } from '$lib/elements';
	import { Button } from '$lib/elements/forms';
	import {
		Table,
		TableBody,
		TableCellHead,
		TableCellText,
		TableHeader,
		TableRow
	} from '$lib/elements/table';
	import { sdkForConsole } from '$lib/stores/sdk';
	import CreateDomain from './_createDomain.svelte';

	const projectId = $page.params.project;
	const listDomains = () => sdkForConsole.projects.listDomains(projectId);

	let request = listDomains();
	let addDomain = false;
</script>

<h1>Custom Domains</h1>
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
				<TableRow>
					<TableCellText title="Scopes">
						<Pill failed={!domain.verification} success={domain.verification}>
							{domain.verification ? 'Unverified' : 'Verified'}
						</Pill>
					</TableCellText>
					<TableCellText title="Domain">
						{domain.domain}
					</TableCellText>
					<TableCellText title="TLS">
						{#if domain.certificateId}
							Verified
						{:else if domain.verification}
							In Progress
						{:else}
							Pending Verification
						{/if}
					</TableCellText>
				</TableRow>
			{/each}
		</TableBody>
	</Table>
{/await}

<Button on:click={() => (addDomain = true)}>Add Domain</Button>
<CreateDomain bind:show={addDomain} on:created={() => (request = listDomains())} />
