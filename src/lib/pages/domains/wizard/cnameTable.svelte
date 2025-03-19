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

<Table.Root>
    <svelte:fragment slot="header">
        <Table.Header.Cell>Type</Table.Header.Cell>
        <Table.Header.Cell>Name</Table.Header.Cell>
        <Table.Header.Cell>Value</Table.Header.Cell>
        <Table.Header.Cell width="40px" />
    </svelte:fragment>
    <Table.Row>
        <Table.Cell>CNAME</Table.Cell>
        <Table.Cell>{cnameValue}</Table.Cell>
        <Table.Cell>
            {target}
        </Table.Cell>
        <Table.Cell>
            <Button text>
                <Copy value={target}>
                    <span class="icon-duplicate" aria-hidden="true" />
                </Copy>
            </Button>
        </Table.Cell>
    </Table.Row>
</Table.Root>
