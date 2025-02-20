<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { registerCommands, updateCommandGroupRanks } from '$lib/commandCenter';
    import { Arrow, CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button } from '$lib/elements/forms';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import Table from '$lib/elements/table/table.svelte';
    import { isSameDay, toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { realtime, sdk } from '$lib/stores/sdk';
    import { GRACE_PERIOD_OVERRIDE, isSelfHosted } from '$lib/system';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import { openImportWizard } from './(import)';
    import Details from './details.svelte';
    import ExportModal from './exportModal.svelte';
    import Status from '$lib/components/status.svelte';
    import { capitalize } from '$lib/helpers/string';
    import { readOnly } from '$lib/stores/billing';
    import type { Models } from '@appwrite.io/console';
    import { canWriteProjects } from '$lib/stores/roles';
    import { page } from '$app/stores';

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

    onMount(() => {
        return realtime
            .forProject($page.params.region, $page.params.project)
            .subscribe(['project', 'console'], (response) => {
                if (response.events.includes('migrations.*')) {
                    invalidate(Dependencies.MIGRATIONS);
                }
            });
    });

    $: $registerCommands([
        {
            label: 'Import data',
            icon: 'download',
            keys: ['i', 'd'],
            callback: openImportWizard,
            group: 'migrations',
            disabled: !$canWriteProjects
        },
        isSelfHosted
            ? {
                  label: 'Deploy to cloud',
                  icon: 'cloud',
                  keys: ['d', 'c'],
                  callback: deployToCloud,
                  group: 'migrations'
              }
            : {
                  label: 'Export data',
                  icon: 'upload',
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

        // const migrationData = {
        //     endpoint: PUBLIC_MOCK_ENDPOINT,
        //     projectId: PUBLIC_MOCK_PROJECTID,
        //     apiKey: PUBLIC_MOCK_APIKEY
        // };

        // window.location.href = `http://localhost:3000/?migrate=${encodeURIComponent(
        //     JSON.stringify(migrationData)
        // )}`;
    };

    function showDetails(m: Models.Migration) {
        showMigration = true;
        migration = m;
    }
</script>

<Container>
    <div class="u-flex u-cross-center u-gap-8">
        <Heading tag="h2" size="5">Migrations</Heading>
        <div class="tag eyebrow-heading-3">
            <span class="text u-x-small">Experimental</span>
        </div>
    </div>

    <CardGrid>
        <Heading tag="h3" size="7">Import project data</Heading>
        <p class="text">
            Import data from another platform or from a different Appwrite instance. <a
                class="link"
                href="https://appwrite.io/docs/advanced/migrations"
                target="_blank"
                rel="noopener noreferrer">
                Learn about which platforms are supported</a
            >.
        </p>
        <svelte:fragment slot="aside">
            {#if data.migrations.length}
                <div class="u-flex">
                    <div style="margin-inline-start: auto;">
                        <Button secondary on:click={openImportWizard}>Import data</Button>
                    </div>
                </div>

                <Table noStyles>
                    <TableHeader>
                        <TableCellHead>Date</TableCellHead>
                        <TableCellHead>Source</TableCellHead>
                        <TableCellHead>Status</TableCellHead>
                        <TableCellHead />
                    </TableHeader>
                    <TableBody>
                        {#each data.migrations as entry}
                            <TableRow>
                                {@const status = getStatus(entry.status)}
                                <TableCell title="Data">
                                    {isSameDay(new Date(), new Date(entry.$createdAt))
                                        ? 'Today'
                                        : toLocaleDate(entry.$createdAt)}
                                </TableCell>
                                <TableCell title="Source">{entry.source}</TableCell>
                                <TableCell title="Status">
                                    <Status {status}>
                                        {capitalize(status)}
                                    </Status>
                                </TableCell>
                                <TableCell title="" showOverflow>
                                    <div class="u-flex u-main-end">
                                        <Button secondary on:click={() => showDetails(entry)}
                                            >Details</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
            {:else}
                <div class="import-box">
                    <ul class="avatars-group is-with-border">
                        <li class="avatars-group-item">
                            <div class="avatar">
                                <i class="icon-user-group" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <i class="icon-database" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <i class="icon-lightning-bolt" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <i class="icon-folder" />
                            </div>
                        </li>
                    </ul>
                    <div class="u-margin-block-start-8">
                        <Arrow direction="down" />
                    </div>
                    <div class="avatar u-margin-block-start-8" style="--size: {48 / 16}rem">
                        <span class="icon-cloud" />
                    </div>
                    <Button
                        class="u-margin-block-start-20"
                        secondary
                        on:click={openImportWizard}
                        disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}>
                        Import data
                    </Button>
                </div>
            {/if}
        </svelte:fragment>
    </CardGrid>
    {#if isSelfHosted}
        <CardGrid>
            <Heading tag="h3" size="7">Deploy to Cloud</Heading>
            <p class="text">
                Export data from your project to Appwrite Cloud. <a
                    class="link"
                    href="https://appwrite.io/docs/advanced/migrations/self-hosted"
                    target="_blank"
                    rel="noopener noreferrer">
                    Learn more in our documentation.</a>
            </p>
            <svelte:fragment slot="aside">
                <div class="import-box">
                    <div class="u-flex u-cross-center u-gap-8">
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-server" />
                        </div>
                        <Arrow direction="right" />
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-cloud" />
                        </div>
                    </div>
                    <Button class="u-margin-block-start-48" secondary on:click={deployToCloud}>
                        Deploy to Cloud
                    </Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <CardGrid>
            <Heading tag="h3" size="7">Export to self-hosted instance</Heading>
            <p class="text">
                Export data from your project to a self-hosted instance. <a
                    class="link"
                    href="https://appwrite.io/docs/advanced/migrations/self-hosted"
                    target="_blank"
                    rel="noopener noreferrer">
                    Learn more in our documentation.</a>
            </p>
            <svelte:fragment slot="aside">
                <div class="import-box">
                    <div class="u-flex u-cross-center u-gap-8">
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-cloud" />
                        </div>
                        <Arrow direction="right" />
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-server" />
                        </div>
                    </div>
                    <Button
                        class="u-margin-block-start-48"
                        secondary
                        on:click={() => (showExport = true)}>Export data</Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<ExportModal bind:show={showExport} />

<Details {migration} bind:show={showMigration} />

<style lang="scss">
    .import-box {
        display: grid;
        place-items: center;

        border: 1px dashed hsl(var(--color-border));
        border-radius: 1rem;

        height: 100%;

        padding: 1.5rem;
    }
</style>
