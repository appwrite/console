<script lang="ts">
    import { invalidate } from '$app/navigation';
    import {
        PUBLIC_MOCK_APIKEY,
        PUBLIC_MOCK_ENDPOINT,
        PUBLIC_MOCK_PROJECTID
    } from '$env/static/public';
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
    import { parseIfString } from '$lib/helpers/object';
    import { capitalize } from '$lib/helpers/string';
    import { Container } from '$lib/layout';
    import { sdk } from '$lib/stores/sdk';
    import { isSelfHosted } from '$lib/system';
    import { onMount } from 'svelte';
    import { project } from '../../store';
    import { openImportWizard } from './(import)';
    import Details from './details.svelte';
    import ExportModal from './exportModal.svelte';

    export let data;
    let details: string | null = null;
    let showExport = false;

    const getStatus = (status: string) => {
        if (status === 'failed') {
            return { text: 'Failed', icon: 'exclamation', iconColor: 'danger' };
        } else if (status === 'completed') {
            return { text: 'Completed', icon: 'check', iconColor: 'success' };
        }

        return { text: 'Pending', icon: 'clock', iconColor: 'blue' };
    };

    onMount(async () => {
        return sdk.forConsole.client.subscribe(['project', 'console'], (response) => {
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
            group: 'migrations'
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

    $: $updateCommandGroupRanks((prev) => ({
        ...prev,
        migrations: 100
    }));

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

        // const migrationData = {
        //     endpoint: currEndpoint,
        //     projectId: $project.$id,
        //     apiKey: secret
        // };

        const migrationData = {
            endpoint: PUBLIC_MOCK_ENDPOINT,
            projectId: PUBLIC_MOCK_PROJECTID,
            apiKey: PUBLIC_MOCK_APIKEY
        };

        window.location.href = `http://localhost:3000/?migrate=${encodeURIComponent(
            JSON.stringify(migrationData)
        )}`;

        // window.location.href = `https://cloud.appwrite.io/?migrate=${encodeURIComponent(
        //     JSON.stringify(migrationData)
        // )}`;
    };
</script>

<Container>
    <Heading tag="h2" size="5">Migrations</Heading>

    <CardGrid>
        <Heading tag="h3" size="7">Import project data</Heading>
        <p class="text">Import data from other products or from a different Appwrite instance</p>
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
                                {@const source = capitalize(parseIfString(entry.source).type)}
                                {@const status = getStatus(entry.status)}
                                <TableCell title="Data">
                                    {isSameDay(new Date(), new Date(entry.$createdAt))
                                        ? 'Today'
                                        : toLocaleDate(entry.$createdAt)}
                                </TableCell>
                                <TableCell title="Source">{source}</TableCell>
                                <TableCell title="Status">
                                    <div class="u-flex u-gap-4 u-cross-center">
                                        <i
                                            class="icon-{status.icon}"
                                            style="color: hsl(var(--color-text-{status.iconColor}))" />
                                        <span>{status.text}</span>
                                    </div>
                                </TableCell>
                                <TableCell title="">
                                    <Button secondary on:click={() => (details = entry.$id)}
                                        >Details</Button>
                                </TableCell>
                            </TableRow>
                        {/each}
                    </TableBody>
                </Table>
            {:else}
                <div class="import-box">
                    <ul class="avatars-group">
                        <li class="avatars-group-item">
                            <div class="avatar">
                                <img src="/logos/firebase.png" alt="Firebase" width="20" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <img src="/logos/supabase.png" alt="Supabase" width="20" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <img src="/logos/nhost.png" alt="nhost" width="20" />
                            </div>
                        </li>

                        <li class="avatars-group-item">
                            <div class="avatar">
                                <img src="/logos/appwrite.png" alt="Appwrite" width="18" />
                            </div>
                        </li>
                    </ul>
                    <div class="u-margin-block-start-8">
                        <Arrow direction="down" />
                    </div>
                    <div class="avatar u-margin-block-start-8" style="--size: {48 / 16}rem">
                        <span class="icon-cloud" />
                    </div>
                    <Button class="u-margin-block-start-20" secondary on:click={openImportWizard}>
                        Import data
                    </Button>
                </div>
            {/if}
        </svelte:fragment>
    </CardGrid>
    {#if isSelfHosted}
        <CardGrid>
            <Heading tag="h3" size="7">Deploy to Cloud</Heading>
            <p class="text">Export data from your project to Appwrite Cloud</p>
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
                    <Button class="u-margin-block-start-48" secondary on:click={deployToCloud}
                        >Deploy to Cloud</Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <CardGrid>
            <Heading tag="h3" size="7">Export to self-hosted instance</Heading>
            <p class="text">Export data from your project to a self-hosted instance</p>
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

<Details bind:migrationId={details} migrations={data.migrations} />

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
