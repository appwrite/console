<script lang="ts">
    import { Modal, Output, Copy, Alert } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Table, TableBody, TableCell, TableRow } from '$lib/elements/table';
    import { type Models } from '@appwrite.io/console';

    export let showRecoveryCodes = false;
    export let codes: Models.MfaRecoveryCodes = null;
</script>

<Modal title="Recovery codes" bind:show={showRecoveryCodes}>
    {#if codes}
        {@const formattedBackupCodes = codes.recoveryCodes.join('\n')}
        <Alert type="warning">
            <span slot="title">
                Securely store your recovery codes as they won't be visible again for security
                purposes
            </span>
            <p>
                Use security codes for emergency sign-ins in case you've lost access to your mobile
                device. Each recovery code can only be used once.
            </p>
        </Alert>
        <div
            style:flex-direction="row-reverse"
            class="u-flex u-flex-vertical-mobile u-main-space-between u-gap-16">
            <ul class="buttons-list">
                <li class="buttons-list-item">
                    <Button
                        download="appwrite-backups.txt"
                        href={`data:application/octet-stream;charset=utf-8,${formattedBackupCodes}`}
                        text>
                        <span class="icon-download u-font-size-20" aria-hidden="true" />
                        <span class="text">Download .txt</span>
                    </Button>
                </li>
                <li class="buttons-list-item">
                    <Copy value={formattedBackupCodes} appendTo="parent">
                        <Button text>
                            <span class="icon-duplicate" />
                            <span class="text">Copy all</span>
                        </Button>
                    </Copy>
                </li>
            </ul>
        </div>
        <Table noMargin noStyles>
            <TableBody>
                {#each codes.recoveryCodes as code}
                    <TableRow>
                        <TableCell title="code">
                            <Output value={code} hideCopyIcon>{code}</Output>
                        </TableCell>
                        <TableCell title="actions" width={24}>
                            <Copy value={code} appendTo="parent">
                                <span class="icon-duplicate" aria-hidden="true" />
                            </Copy>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    {/if}
</Modal>
