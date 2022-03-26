<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Pagination } from '$lib/components';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellLink,
        TableCellText
    } from '$lib/elements/table';
    import { func } from './store';
    import { Container } from '$lib/layout';
    import Create from './_create.svelte';
    import { base } from '$app/paths';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const functionId = $page.params.function;

    $: request = sdkForProject.functions.listDeployments(functionId, search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <h1>Overview</h1>

    <Card>
        <p><b>Function ID:</b> {$func.$id}</p>
        <p><b>Runtime:</b> {$func.runtime}</p>
        <p><b>Last Updated:</b> {$func.dateUpdated}</p>
        <p><b>Created:</b> {$func.dateCreated}</p>
    </Card>

    <h1>Deployments</h1>

    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        <Table>
            <TableHeader>
                <TableCellHead>ID</TableCellHead>
                <TableCellHead>Active</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each response.deployments as deployment}
                    <TableRow>
                        <TableCellLink
                            title="ID"
                            href={`${base}/console/${project}/storage/bucket/${functionId}/${deployment.$id}`}>
                            {deployment.$id}
                        </TableCellLink>
                        <TableCellText title="Active">{deployment.activate}</TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>

        <Pagination {limit} bind:offset sum={response.total} />
    {/await}

    <Button on:click={() => (showCreate = true)}>Upload</Button>
</Container>

<Create bind:showCreate />
