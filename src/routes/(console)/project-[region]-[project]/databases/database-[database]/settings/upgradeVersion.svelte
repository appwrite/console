<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Modal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSelect } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { Typography, Layout } from '@appwrite.io/pink-svelte';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let statusDetail: Models.DatabaseStatus | null = $state(null);
    let showConfirm = $state(false);
    let isUpgrading = $state(false);
    let targetVersion: string = $state('');
    let isLoading = $state(true);

    const engineVersions: Record<string, string[]> = {
        postgres: ['17', '18'],
        mysql: ['8.0', '8.4'],
        mariadb: ['10.11', '11.4'],
        mongodb: ['7.0', '8.0']
    };

    const versionOptions = $derived(
        (engineVersions[database.engine] ?? [])
            .filter((v) => {
                const parse = (s: string) => s.split('.').map(Number);
                const [major = 0, minor = 0] = parse(v);
                const [currentMajor = 0, currentMinor = 0] = parse(database.version);
                return major > currentMajor || (major === currentMajor && minor > currentMinor);
            })
            .map((v) => ({ value: v, label: v }))
    );

    const currentVersion = $derived(statusDetail?.version ?? database.version);

    onMount(async () => {
        try {
            statusDetail = await sdk
                .forProject(page.params.region, page.params.project)
                .compute.getDatabaseStatus({ databaseId: database.$id });
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
                .compute.createDatabaseUpgrade({ databaseId: database.$id, targetVersion });

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
        Upgrade your database engine to a newer version. This operation uses green/blue deployment with
        zero downtime.
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
                <InputSelect
                    id="targetVersion"
                    label="Target version"
                    placeholder="Select a version"
                    bind:value={targetVersion}
                    options={versionOptions} />
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

    <Modal title="Upgrade database version" bind:show={showConfirm} onSubmit={upgradeVersion}>
        <p class="text">
            Are you sure you want to upgrade <b>{database.name}</b> from version
            <b>{currentVersion}</b> to <b>{targetVersion}</b>? This operation uses green/blue
            deployment with zero downtime.
        </p>
        <svelte:fragment slot="footer">
            <Button text on:click={() => (showConfirm = false)}>Cancel</Button>
            <Button submit disabled={isUpgrading}>
                {isUpgrading ? 'Upgrading...' : 'Upgrade'}
            </Button>
        </svelte:fragment>
    </Modal>
{/if}
