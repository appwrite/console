<script lang="ts">
    import { Empty, Heading } from '$lib/components';
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
    import type { PageData } from './$types';
    import Create from './create.svelte';
    export let data: PageData;
    let show = false;
</script>

<div class="common-section u-flex u-gap-12">
    <Heading tag="h3" size="7">API Keys</Heading>
    <span class="u-margin-inline-start-auto">
        <Button on:click={() => (show = true)}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create API Key</span>
        </Button>
    </span>
</div>

{#if data.keys.total}
    <Table>
        <TableHeader>
            <TableCellHead>Name</TableCellHead>
            <TableCellHead>last accessed</TableCellHead>
            <TableCellHead>expiration date</TableCellHead>
            <TableCellHead>clients</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each data.keys.keys as key}
                <TableRowLink href={`keys/${key.$id}`}>
                    <TableCellText title="Name">
                        {key.name}
                    </TableCellText>
                    <TableCellText title="Last Accessed">
                        {key.accessedAt ? toLocaleDateTime(key.accessedAt) : 'never'}
                    </TableCellText>
                    <TableCellText title="Expiration Date">
                        {toLocaleDateTime(key.$updatedAt)}
                    </TableCellText>
                    <TableCellText title="Clients" />
                </TableRowLink>
            {/each}
        </TableBody>
    </Table>
{:else}
    <Empty isButton single on:click={() => (show = true)}>
        <div class="u-text-center">
            <p class="text u-line-height-1-5">Create your first API Key to get started</p>
            <p class="text u-line-height-1-5">Need a hand? Check out our documentation.</p>
        </div>
        <div class="u-flex u-gap-12">
            <Button external href="https://appwrite.io/docs/keys" text>Documentation</Button>
            <Button secondary>Create API Key</Button>
        </div>
    </Empty>
{/if}

<Create bind:show />
