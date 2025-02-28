<script lang="ts" context="module">
    export function createDevKey() {
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
    <Heading tag="h3" size="7">Dev keys</Heading>
    {#if $canWriteKeys}
        <span class="u-margin-inline-start-auto">
            <Button on:click={createDevKey}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text"> Create Dev key </span>
            </Button>
        </span>
    {/if}
</div>

{#if data.devKeys.total}
    <Table>
        <TableHeader>
            <TableCellHead>Name</TableCellHead>
            <TableCellHead onlyDesktop>last accessed</TableCellHead>
            <TableCellHead onlyDesktop>expiration date</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each data.devKeys.keys as key}
                <TableRowLink href={`dev-keys/${key.$id}`}>
                    <TableCellText title="Name">
                        {key.name}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Last Accessed">
                        {key.accessedAt ? toLocaleDate(key.accessedAt) : 'never'}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Expiration Date">
                        {key.expire ? toLocaleDateTime(key.expire) : 'never'}
                    </TableCellText>
                </TableRowLink>
            {/each}
        </TableBody>
    </Table>
{:else}
    <!-- TODO: create correct links method -->
    <Empty
        single
        allowCreate={$canWriteKeys}
        href="https://appwrite.io/docs/advanced/platform/dev-keys"
        target="Dev key"
        on:click={createDevKey} />
{/if}
