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

    const parts = $domain.domain.split('.');
    const registerable = [parts[parts.length - 2], parts[parts.length - 1]].join('.');
    const cnameValue = $domain.domain.replace('.' + registerable, '');
</script>

<Table noStyles noMargin>
    <TableHeader>
        <TableCellHead>Type</TableCellHead>
        <TableCellHead>Name</TableCellHead>
        <TableCellHead>Value</TableCellHead>
        <TableCellHead width={50} />
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCellText title="Type">CNAME</TableCellText>
            <TableCellText title="Name">{cnameValue}</TableCellText>
            <TableCellText title="Value">
                {$domain.domain}
            </TableCellText>
            <TableCell>
                <Button text>
                    <Copy value={$domain.domain}>
                        <span class="icon-duplicate" aria-hidden="true" />
                    </Copy>
                </Button>
            </TableCell>
        </TableRow>
    </TableBody>
</Table>
