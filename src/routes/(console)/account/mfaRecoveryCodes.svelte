<script lang="ts">
    import { Modal, Output, Copy } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { type Models } from '@appwrite.io/console';
    import { IconDownload, IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Alert, Layout, Divider, Table } from '@appwrite.io/pink-svelte';

    export let showRecoveryCodes = false;
    export let codes: Models.MfaRecoveryCodes = null;
</script>

<Modal title="Recovery codes" bind:show={showRecoveryCodes}>
    {#if codes}
        {@const formattedBackupCodes = codes.recoveryCodes.join('\n')}
        <Alert.Inline
            status="warning"
            title="Securely store your recovery codes as they won't be visible again for security
        purposes">
            Use security codes for emergency sign-ins in case you've lost access to your mobile
            device. Each recovery code can only be used once.
        </Alert.Inline>
        <Layout.Stack direction="row-reverse" alignItems="center" gap="s">
            <Button
                download="appwrite-backups.txt"
                href={`data:application/octet-stream;charset=utf-8,${formattedBackupCodes}`}
                text>
                <Icon icon={IconDownload} slot="start" size="s" />
                Download .txt
            </Button>
            <span style:height="20px">
                <Divider vertical />
            </span>
            <Copy value={formattedBackupCodes}>
                <Button text>
                    <Icon icon={IconDuplicate} slot="start" size="s" />
                    Copy all
                </Button>
            </Copy>
        </Layout.Stack>
        <Table.Root columns={[{ id: 'code' }, { id: 'action', width: 24 }]} let:root>
            {#each codes.recoveryCodes as code}
                <Table.Row.Base {root}>
                    <Table.Cell column="code" {root}>
                        <Output value={code} hideCopyIcon>{code}</Output>
                    </Table.Cell>
                    <Table.Cell column="action" {root}>
                        <Copy value={code}>
                            <Icon icon={IconDuplicate} />
                        </Copy>
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    {/if}
</Modal>
