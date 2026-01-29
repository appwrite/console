<script lang="ts">
    import { Modal, CopyInput, Code } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Layout, Typography, Alert, Icon } from '@appwrite.io/pink-svelte';
    import { IconDuplicate } from '@appwrite.io/pink-icons-svelte';
    import { copy } from '$lib/helpers/copy';
    import { addNotification } from '$lib/stores/notifications';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';

    let {
        show = $bindable(false),
        database,
        connectionCommand
    }: {
        show: boolean;
        database: DedicatedDatabase;
        connectionCommand: string;
    } = $props();

    function getEngineDisplayName(engine: string): string {
        switch (engine) {
            case 'postgres':
                return 'PostgreSQL';
            case 'mysql':
                return 'MySQL';
            case 'mariadb':
                return 'MariaDB';
            default:
                return engine;
        }
    }

    function getEngineCliName(engine: string): string {
        switch (engine) {
            case 'postgres':
                return 'psql';
            case 'mysql':
            case 'mariadb':
                return 'mysql';
            default:
                return engine;
        }
    }

    async function copyConnectionString() {
        if (!database.connectionString) return;
        const success = await copy(database.connectionString);
        if (success) {
            addNotification({
                type: 'success',
                message: 'Connection string copied to clipboard'
            });
        } else {
            addNotification({
                type: 'error',
                message: 'Failed to copy to clipboard'
            });
        }
    }

    async function copyCommand() {
        const success = await copy(connectionCommand);
        if (success) {
            addNotification({
                type: 'success',
                message: 'Command copied to clipboard'
            });
        } else {
            addNotification({
                type: 'error',
                message: 'Failed to copy to clipboard'
            });
        }
    }
</script>

<Modal title="Connect to Database" bind:show size="l">
    <Layout.Stack gap="xl">
        <Alert.Inline status="info" title="Connection Options">
            Choose how you want to connect to your {getEngineDisplayName(database.engine)} database.
        </Alert.Inline>

        <!-- Connection String Option -->
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Connection String</Typography.Text>
            <Typography.Text variant="m-400">
                Use this URI to connect from your application or database client.
            </Typography.Text>
            {#if database.connectionString}
                <CopyInput value={database.connectionString} />
            {/if}
        </Layout.Stack>

        <!-- CLI Command Option -->
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Terminal Command</Typography.Text>
            <Typography.Text variant="m-400">
                Run this command in your terminal to connect using {getEngineCliName(
                    database.engine
                )}.
            </Typography.Text>

            <div class="command-block">
                <Code language="sh" code={connectionCommand} withCopy />
            </div>
        </Layout.Stack>

        <!-- Quick Reference -->
        <Layout.Stack gap="s">
            <Typography.Text variant="m-600">Quick Reference</Typography.Text>
            <div class="reference-grid">
                <div class="reference-item">
                    <Typography.Text variant="m-500">Host</Typography.Text>
                    <Typography.Text variant="m-400">{database.hostname || '-'}</Typography.Text>
                </div>
                <div class="reference-item">
                    <Typography.Text variant="m-500">Port</Typography.Text>
                    <Typography.Text variant="m-400">{database.connectionPort || '-'}</Typography.Text>
                </div>
                <div class="reference-item">
                    <Typography.Text variant="m-500">Database</Typography.Text>
                    <Typography.Text variant="m-400">postgres</Typography.Text>
                </div>
                <div class="reference-item">
                    <Typography.Text variant="m-500">Username</Typography.Text>
                    <Typography.Text variant="m-400">{database.connectionUser || '-'}</Typography.Text>
                </div>
            </div>
        </Layout.Stack>
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Layout.Stack
            direction="row"
            gap="s"
            justifyContent="space-between"
            wrap="wrap"
            style="width: 100%;">
            <Layout.Stack direction="row" gap="s">
                <Button secondary on:click={copyConnectionString}>
                    <Icon icon={IconDuplicate} size="s" slot="start" />
                    Copy Connection String
                </Button>
                <Button secondary on:click={copyCommand}>
                    <Icon icon={IconDuplicate} size="s" slot="start" />
                    Copy Command
                </Button>
            </Layout.Stack>
            <Button text on:click={() => (show = false)}>Close</Button>
        </Layout.Stack>
    </svelte:fragment>
</Modal>

<style lang="scss">
    .command-block {
        :global(.box) {
            margin: 0;
        }
    }

    .reference-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;

        @media (max-width: 480px) {
            grid-template-columns: 1fr;
        }
    }

    .reference-item {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
</style>
