<script lang="ts">
    import { base } from '$app/paths';

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
                            <TableCellLink
                                href={`${base}/console/project-${projectId}/keys/key/${key.$id}`}
                                title="Name">
                                {key.name}
                            </TableCellLink>
                            <TableCellText title="Scopes">{key.scopes.length}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Empty>
                <div class="u-flex u-flex-vertical">
                    <div class="common-section">No API Keys Found</div>
                    <div class="common-section">
                        You haven't created any API keys for your project yet.
                    </div>
                </div>
            </Empty>
        {/if}
        <Button on:click={() => (showCreate = true)}>Add API Key</Button>
    {/if}
</Container>
<Create bind:show={showCreate} />
