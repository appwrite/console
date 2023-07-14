<script lang="ts" context="module">
    export function createApiKey() {
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
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import Wizard from './wizard.svelte';

    export let data: PageData;
</script>

<div class="common-section u-flex u-gap-12">
    <Heading tag="h3" size="7">API Keys</Heading>
    <span class="u-margin-inline-start-auto">
        <Button on:click={createApiKey}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create API Key</span>
        </Button>
    </span>
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
                        {key.accessedAt ? toLocaleDateTime(key.accessedAt) : 'never'}
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
    <Empty single href="https://appwrite.io/docs/keys" target="API Key" on:click={createApiKey} />
{/if}
