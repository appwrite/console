<script lang="ts">
    import { afterNavigate } from '$app/navigation';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink
    } from '$lib/elements/table';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { updateLayout } from '$lib/stores/layout';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import Create from './create.svelte';

    let show = false;

    onMount(handle);
    afterNavigate(handle);

    function handle(navigate = null) {
        updateLayout({
            navigate,
            title: $project.name,
            level: 3,
            breadcrumbs: {
                href: 'keys',
                title: 'API Keys'
            }
        });
    }
</script>

<div class="common-section u-flex u-gap-12">
    <h3 class="heading-level-7">API Keys</h3>
    <span class="u-margin-inline-start-auto">
        <Button on:click={() => (show = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create API Key</span>
        </Button>
    </span>
</div>

<Table>
    <TableHeader>
        <TableCellHead>Name</TableCellHead>
        <TableCellHead>last accessed</TableCellHead>
        <TableCellHead>expiration date</TableCellHead>
        <TableCellHead>clients</TableCellHead>
    </TableHeader>
    <TableBody>
        {#each $project.keys as key}
            <TableRowLink href={`keys/${key.$id}`}>
                <TableCellText title="Name">
                    {key.name}
                </TableCellText>
                <TableCellText title="Last Accessed">
                    {toLocaleDateTime(key.$createdAt)}
                </TableCellText>
                <TableCellText title="Expiration Date">
                    {toLocaleDateTime(key.$updatedAt)}
                </TableCellText>
                <TableCellText title="Clients" />
            </TableRowLink>
        {/each}
    </TableBody>
</Table>

<Create bind:show />
