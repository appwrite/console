<script lang="ts">
    import { Copy } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Table } from '@appwrite.io/pink-svelte';
    import { domain } from './store';

    const target = window?.location.hostname ?? '';
    $: parts = $domain.domain.split('.');
    $: registerable = [parts[parts.length - 2], parts[parts.length - 1]].join('.');
    $: cnameValue = $domain.domain.replace('.' + registerable, '');
</script>

<Table.Root
    let:root
    columns={[{ id: 'type' }, { id: 'name' }, { id: 'value' }, { id: 'action', width: 40 }]}>
    <svelte:fragment slot="header" let:root>
        <Table.Header.Cell column="type" {root}>Type</Table.Header.Cell>
        <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
        <Table.Header.Cell column="value" {root}>Value</Table.Header.Cell>
        <Table.Header.Cell column="action" {root} />
    </svelte:fragment>
    <Table.Row.Base {root}>
        <Table.Cell column="type" {root}>CNAME</Table.Cell>
        <Table.Cell column="name" {root}>{cnameValue}</Table.Cell>
        <Table.Cell column="value" {root}>
            {target}
        </Table.Cell>
        <Table.Cell column="action" {root}>
            <Button text>
                <Copy value={target}>
                    <span class="icon-duplicate" aria-hidden="true"></span>
                </Copy>
            </Button>
        </Table.Cell>
    </Table.Row.Base>
</Table.Root>
