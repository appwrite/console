<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase, DatabaseStatusDetail } from '$lib/sdk/dedicatedDatabases';
    import { onMount } from 'svelte';
    import { Typography, Layout } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    let statusDetail: DatabaseStatusDetail | null = $state(null);
    let showConfirm = $state(false);
    let isUpgrading = $state(false);
    let targetVersion: string = $state('');
    let isLoading = $state(true);

    const currentVersion = $derived(statusDetail?.version ?? database.version);

    onMount(async () => {
        try {
            statusDetail = await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.getStatus(database.$id);
        } catch {
            // Status not available
        } finally {
            isLoading = false;
        }
    });

    async function upgradeVersion() {
        isUpgrading = true;
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.upgradeVersion(database.$id, targetVersion);

            await invalidate(Dependencies.DATABASE);

            showConfirm = false;

            addNotification({
                message: `Database is upgrading to version ${targetVersion}. This may take a few minutes.`,
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpgradeVersion);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpgradeVersion);
        } finally {
            isUpgrading = false;
        }
    }
</script>

{#if !isLoading}
    <CardGrid>
        <svelte:fragment slot="title">Version</svelte:fragment>
        Upgrade your database engine to a newer version. This operation may cause a brief
        interruption.
        <svelte:fragment slot="aside">
            <Layout.Stack gap="m">
                <Layout.Stack gap="xxs">
                    <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                        Current version
                    </Typography.Caption>
                    <Typography.Text variant="m-500">
                        {currentVersion}
                    </Typography.Text>
                </Layout.Stack>
                <InputText
                    id="targetVersion"
                    label="Target version"
                    placeholder="e.g. 16.2"
                    bind:value={targetVersion} />
            </Layout.Stack>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                secondary
                disabled={!targetVersion || targetVersion === currentVersion}
                on:click={() => {
                    showConfirm = true;
                    trackEvent('click_database_upgrade_version');
                }}>
                Upgrade
            </Button>
        </svelte:fragment>
    </CardGrid>

    <Modal
        title="Upgrade database version"
        bind:show={showConfirm}
        onSubmit={upgradeVersion}>
        <p class="text">
            Are you sure you want to upgrade <b>{database.name}</b> from version
            <b>{currentVersion}</b> to <b>{targetVersion}</b>? The database may be briefly
            unavailable during the upgrade.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showConfirm = false)}>Cancel</Button>
            <Button submit disabled={isUpgrading}>
                {isUpgrading ? 'Upgrading...' : 'Upgrade'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
