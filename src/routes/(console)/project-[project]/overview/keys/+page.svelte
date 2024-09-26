<script lang="ts" context="module">
    export function createApiKey() {
        if (!get(canWriteKeys)) {
            return;
        }
        wizard.start(Wizard);
    }
</script>

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
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { canWriteKeys } from '$lib/stores/roles';
    import { wizard } from '$lib/stores/wizard';
    import { get } from 'svelte/store';
    import type { PageData } from './$types';
    import Wizard from './wizard.svelte';

    export let data: PageData;
</script>

<div class="common-section u-flex u-gap-12">
    <Heading tag="h3" size="7">API keys</Heading>
    {#if $canWriteKeys}
        <span class="u-margin-inline-start-auto">
            <Button on:click={createApiKey}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Create API key</span>
            </Button>
        </span>
    {/if}
</div>

{#if data.keys.total}
    <Table>
        <TableHeader>
            <TableCellHead>Name</TableCellHead>
            <TableCellHead onlyDesktop>last accessed</TableCellHead>
            <TableCellHead onlyDesktop>expiration date</TableCellHead>
            <TableCellHead onlyDesktop>scopes</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each data.keys.keys as key}
                <TableRowLink href={`keys/${key.$id}`}>
                    <TableCellText title="Name">
                        {key.name}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Last Accessed">
                        {key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Expiration Date">
                        {key.expire ? toLocaleDateTime(key.expire) : 'never'}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Expiration Date">
                        {key.scopes.length} Scopes
                    </TableCellText>
                </TableRowLink>
            {/each}
        </TableBody>
    </Table>
{:else}
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/api-keys"
        target="API key"
        on:click={createApiKey} />
{/if}
