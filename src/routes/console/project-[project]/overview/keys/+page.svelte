<script lang="ts">
    import { Empty, Heading } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRowLink
    } from '$lib/elements/table';
    import { diffDays, readableDateString, toLocaleDateTime } from '$lib/helpers/date';
    import { wizard } from '$lib/stores/wizard';
    import type { PageData } from './$types';
    import Wizard from './wizard.svelte';

    export let data: PageData;

    const today = new Date();

    function create() {
        wizard.start(Wizard);
    }

    const keys = [
        {
            $id: '63e28c0c91e9263384f6',
            $createdAt: '2023-02-07T17:36:12.597+00:00',
            $updatedAt: '2023-02-07T17:36:12.597+00:00',
            name: 'Never',
            expire: '2023-06-11T17:36:12.597+00:00',
            scopes: [],
            secret: 'ecb58b47b3d2eaf6f91ac8e67e7e9681abbe93ad5f3cd86b4748c275f1c1a631eccf5cc9de1e96ba00d705f847e65b2ee36486f4bfdcf08e4e841ec2bb784900a087932cc8aab03d30cd01fef45ced6c127f875ac34a0edbce910a26b28896bac8d73057dc78908a2bfaf4527e00f58d41fc0125b7aa35acb38e3c178aa91299',
            accessedAt: '2023-06-04T17:36:12.597+00:00',
            sdks: []
        }
    ];
</script>

<div class="common-section u-flex u-gap-12">
    <Heading tag="h3" size="7">API Keys</Heading>
    <span class="u-margin-inline-start-auto">
        <Button on:click={create}>
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create API Key</span>
        </Button>
    </span>
</div>

{#if data.keys.total}
    <Table>
        <TableHeader>
            <TableCellHead width={150}>Name</TableCellHead>
            <TableCellHead onlyDesktop>last accessed</TableCellHead>
            <TableCellHead onlyDesktop>expiration date</TableCellHead>
            <TableCellHead onlyDesktop>scopes</TableCellHead>
        </TableHeader>
        <TableBody>
            {#each keys as key}
                {@const diff = diffDays(today, new Date(key.expire), false)}
                <TableRowLink href={`keys/${key.$id}`}>
                    <TableCellText title="Name">
                        {key.name}
                    </TableCellText>
                    <TableCellText onlyDesktop title="Last Accessed">
                        {key.accessedAt ? readableDateString(key.accessedAt) : 'never'}
                    </TableCellText>
                    <TableCell onlyDesktop title="Expiration Date">
                        <span class="u-flex u-gap-12 u-cross-center">
                            {key.expire ? toLocaleDateTime(key.expire) : 'never'}
                            {#if diff <= 0}
                                <Pill warning>Expired</Pill>
                            {:else if diff <= 7}
                                <Pill warning>Expiring Soon</Pill>
                            {/if}
                        </span>
                    </TableCell>
                    <TableCellText onlyDesktop title="Expiration Date">
                        {key.scopes.length} Scopes
                    </TableCellText>
                </TableRowLink>
            {/each}
        </TableBody>
    </Table>
{:else}
    <Empty single href="https://appwrite.io/docs/keys" target="API Key" on:click={create} />
{/if}
