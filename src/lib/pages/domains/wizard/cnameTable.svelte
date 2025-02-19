<script lang="ts">
    import { Copy } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { domain } from './store';
    import { page } from '$app/stores';

    $: parts = $domain.domain.split('.');
    $: registerable = [parts[parts.length - 2], parts[parts.length - 1]].join('.');
    $: cnameValue = $domain.domain.replace('.' + registerable, '');

    const targetValue = () => {
        const region = $page.params.region ?? '';
        return `${region}-${window?.location.hostname ?? ''}`;
    };
</script>

<Table noMargin noStyles style="--p-table-bg-color: var(--transparent);">
    <TableHeader>
        <TableCellHead>Type</TableCellHead>
        <TableCellHead>Name</TableCellHead>
        <TableCellHead>Value</TableCellHead>
        <TableCellHead width={50} />
    </TableHeader>
    <TableBody>
        <TableRow>
            {@const target = targetValue()}
            <TableCellText title="Type">CNAME</TableCellText>
            <TableCellText title="Name">{cnameValue}</TableCellText>
            <TableCellText title="Value">
                {target}
            </TableCellText>
            <TableCell>
                <Button text>
                    <Copy value={target}>
                        <span class="icon-duplicate" aria-hidden="true" />
                    </Copy>
                </Button>
            </TableCell>
        </TableRow>
    </TableBody>
</Table>
