<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Arrow, Avatar, AvatarGroup, CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import { isSameDay, toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { GRACE_PERIOD_OVERRIDE, isSelfHosted } from '$lib/system';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import { openImportWizard } from './(import)';
    import Details from './details.svelte';
    import ExportModal from './exportModal.svelte';
    import { readOnly } from '$lib/stores/billing';
    import type { Models } from '@appwrite.io/console';
    import { canWriteProjects } from '$lib/stores/roles';
    import {
        IconCloud,
        IconDatabase,
        IconDownload,
        IconFolder,
        IconLightningBolt,
        IconServer,
        IconUpload,
        IconUserGroup
    } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Link, Status, Table } from '@appwrite.io/pink-svelte';
    import { capitalize } from '$lib/helpers/string';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { Click, trackEvent } from '$lib/actions/analytics';

    export let data;
    let migration: Models.Migration = null;
    let showExport = false;
    let showMigration = false;

    const getStatus = (status: string) => {
        if (status === 'failed') {
            return 'failed';
        } else if (status === 'completed') {
            return 'completed';
        } else if (status === 'processing') {
            return 'processing';
        }

        return 'pending';
    };

    onMount(async () => {
        sdk.forConsole.client.subscribe(['project', 'console'], (response) => {
            if (response.events.includes('migrations.*')) {
                invalidate(Dependencies.MIGRATIONS);
            }
        });
    });

    $: $registerCommands([
        {
            label: 'Import data',
            icon: IconDownload,
            keys: ['i', 'd'],
            callback: openImportWizard,
            group: 'migrations',
            disabled: !$canWriteProjects
        },
        isSelfHosted
            ? {
                  label: 'Deploy to cloud',
                  icon: IconCloud,
                  keys: ['d', 'c'],
                  callback: deployToCloud,
                  group: 'migrations'
              }
            : {
                  label: 'Export data',
                  icon: IconUpload,
                  keys: ['e', 'd'],
                  callback: () => (showExport = true),
                  group: 'migrations'
              }
    ]);

    $updateCommandGroupRanks({ migrations: 100 });

    const getCurrentEndpoint = () => {
        // Remove subpaths and query strings from the current URL. Add a /v1 suffix
        const url = new URL(window.location.href);
        url.pathname = '';
        url.search = '';
        url.hash = '';
        url.pathname = '/v1';
        return url.toString();
    };

    const deployToCloud = async () => {
        const currEndpoint = getCurrentEndpoint();
        // Create API key
        const { secret } = await sdk.forConsole.projects.createKey(
            $project.$id,
            `[AUTO-GENERATED] Migration ${new Date().toISOString()}`,
            [
                'users.read',
                'teams.read',
                'databases.read',
                'collections.read',
                'attributes.read',
                'indexes.read',
                'documents.read',
                'files.read',
                'buckets.read',
                'functions.read',
                'execution.read',
                'locale.read',
                'avatars.read',
                'health.read'
            ],
            undefined
        );

        const migrationData = {
            endpoint: currEndpoint,
            projectId: $project.$id,
            apiKey: secret
        };

        window.location.href = `https://cloud.appwrite.io/?migrate=${encodeURIComponent(
            JSON.stringify(migrationData)
        )}`;
    };

    function showDetails(m: Models.Migration) {
        showMigration = true;
        migration = m;
    }
</script>

<Container>
    <CardGrid>
        <svelte:fragment slot="title">Import project data</svelte:fragment>
        Import data from another platform or from a different Appwrite instance.
        <Link.Anchor
            href="https://appwrite.io/docs/advanced/migrations"
            target="_blank"
            rel="noopener noreferrer">
            Learn more</Link.Anchor>
        <svelte:fragment slot="aside">
            {#if data.migrations.length}
                <div class="u-flex">
                    <div style="margin-inline-start: auto;">
                        <Button secondary on:click={openImportWizard}>Import data</Button>
                    </div>
                </div>

                <Table.Root>
                    <svelte:fragment slot="header">
                        <Table.Header.Cell>Date</Table.Header.Cell>
                        <Table.Header.Cell>Source</Table.Header.Cell>
                        <Table.Header.Cell>Status</Table.Header.Cell>
                        <Table.Header.Cell />
                    </svelte:fragment>
                    {#each data.migrations as entry}
                        <Table.Row>
                            {@const status = getStatus(entry.status)}
                            <Table.Cell>
                                {#if isSameDay(new Date(), new Date(entry.$createdAt))}
                                    Today
                                {:else}
                                    <DualTimeView time={entry.$createdAt} />
                                {/if}
                            </Table.Cell>
                            <Table.Cell>{entry.source}</Table.Cell>
                            <Table.Cell>
                                <Status label={capitalize(status)} {status} />
                            </Table.Cell>
                            <Table.Cell>
                                <div class="u-flex u-main-end">
                                    <Button secondary on:click={() => showDetails(entry)}
                                        >Details</Button>
                                </div>
                            </Table.Cell>
                        </Table.Row>
                    {/each}
                </Table.Root>
            {:else}
                <Layout.Stack alignItems="center" gap="xl">
                    <Layout.Stack alignItems="center">
                        <AvatarGroup
                            --icon-fill="var(--fgcolor-neutral-tertiary)"
                            icons={[IconUserGroup, IconDatabase, IconLightningBolt, IconFolder]}
                            size="s" />
                        <Arrow direction="down" />
                        <Avatar alt="appwrite" size="s">
                            <Icon icon={IconCloud} size="s" color="--fgcolor-neutral-tertiary" />
                        </Avatar>
                    </Layout.Stack>
                    <Button
                        secondary
                        on:click={openImportWizard}
                        disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}>
                        Import data
                    </Button>
                </Layout.Stack>
            {/if}
        </svelte:fragment>
    </CardGrid>
    {#if isSelfHosted}
        <CardGrid>
            <svelte:fragment slot="title">Deploy to Cloud</svelte:fragment>
            Export data from your project to Appwrite Cloud.
            <Link.Anchor
                href="https://appwrite.io/docs/advanced/migrations/self-hosted"
                target="_blank"
                rel="noopener noreferrer">
                Learn more</Link.Anchor>
            <svelte:fragment slot="aside">
                <Layout.Stack alignItems="center" gap="xl">
                    <Layout.Stack direction="row" justifyContent="center" alignItems="center">
                        <Avatar alt="appwrite" size="s">
                            <Icon icon={IconServer} size="s" color="--fgcolor-neutral-tertiary" />
                        </Avatar>
                        <Arrow direction="right" />
                        <Avatar alt="appwrite" size="s">
                            <Icon icon={IconCloud} size="s" color="--fgcolor-neutral-tertiary" />
                        </Avatar>
                    </Layout.Stack>
                    <div>
                        <Button secondary on:click={deployToCloud}>Deploy to Cloud</Button>
                    </div>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <CardGrid>
            <svelte:fragment slot="title">Export to self-hosted instance</svelte:fragment>
            Export data from your project to a self-hosted instance.
            <Link.Anchor
                class="link"
                href="https://appwrite.io/docs/advanced/migrations/self-hosted"
                target="_blank"
                rel="noopener noreferrer">
                Learn more</Link.Anchor>
            <svelte:fragment slot="aside">
                <Layout.Stack alignItems="center" gap="xl">
                    <Layout.Stack direction="row" justifyContent="center" alignItems="center">
                        <Avatar alt="appwrite" size="s">
                            <Icon icon={IconCloud} size="s" color="--fgcolor-neutral-tertiary" />
                        </Avatar>
                        <Arrow direction="right" />
                        <Avatar alt="appwrite" size="s">
                            <Icon icon={IconServer} size="s" color="--fgcolor-neutral-tertiary" />
                        </Avatar>
                    </Layout.Stack>
                    <div>
                        <Button
                            secondary
                            on:click={() => {
                                showExport = true;
                                trackEvent(Click.SettingsStartMigrationClick);
                            }}>Export data</Button>
                    </div>
                </Layout.Stack>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<ExportModal bind:show={showExport} />

{#if showMigration}
    <Details {migration} bind:show={showMigration} />
{/if}
