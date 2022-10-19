<script lang="ts">
    import { Copy } from '$lib/components';
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

    const parts = $domain.name.split('.');
    const registerable = [parts[parts.length - 2], parts[parts.length - 1]].join('.');
    const cnameValue = $domain.name.replace('.' + registerable, '');
</script>

<Table noStyles noMargin>
    <TableHeader>
        <TableCellHead>Type</TableCellHead>
        <TableCellHead>Name</TableCellHead>
        <TableCellHead>Value</TableCellHead>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCellText title="Type">CNAME</TableCellText>
            <TableCellText title="Name">{cnameValue}</TableCellText>
            <TableCell title="Value">
                <div class="u-flex u-main-space-between u-cross-center">
                    <span class="text">{$domain.name}</span>
                    <Copy value={$domain.name}>
                        <span class="icon-duplicate" aria-hidden="true" />
                    </Copy>
                </div>
            </TableCell>
        </TableRow>
    </TableBody>
</Table>
