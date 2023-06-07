<script lang="ts">
    import { Arrow, CardGrid, Heading } from '$lib/components';
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
    import { capitalize } from '$lib/helpers/string';
    import { Container } from '$lib/layout';
    import { migrator } from '$lib/stores/migrator';
    import { sdk } from '$lib/stores/sdk';
    import { isSelfHosted } from '$lib/system';
    import { openImportWizard } from './(import)';
    import Details from './details.svelte';

    export let data;
    let showDetails = false;

    const mockImport = async () => {
        console.log(await sdk.forProject.imports.list());
    };

    mockImport();

    const getStatus = (status: string) => {
        if (status === 'pending') {
            return { text: 'Pending', icon: 'clock', iconColor: 'blue' };
        }
    };
</script>

<Container>
    <Heading tag="h2" size="5">Migrations</Heading>
    {#if isSelfHosted}
        <CardGrid>
            <Heading tag="h3" size="7">Import project data</Heading>
            <p class="text">
                Import project data from Cloud to your self-hosted project. Initiate the process of
                importing project data from the migrations settings of your Cloud project.
            </p>
            <svelte:fragment slot="aside">
                {#if $migrator.status === 'idle'}
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
                            <TableCell title="Data">Today</TableCell>
                            <TableCell title="Source">Heaven</TableCell>
                            <TableCell title="Status">Awesome</TableCell>
                            <TableCell title="">
                                <Button secondary on:click={() => (showDetails = true)}
                                    >Details</Button>
                            </TableCell>
                        </TableBody>
                    </Table>
                {:else}
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
                        <p class="u-margin-block-start-24">No imported data yet</p>
                    </div>
                {/if}
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <Heading tag="h3" size="7">Deploy to Cloud</Heading>
            <p class="text">Export data from your project to Appwrite Cloud</p>
            <svelte:fragment slot="aside">
                <div class="import-box">
                    <div class="u-flex u-cross-center u-gap-8">
                        {#if isSelfHosted}
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-server" />
                            </div>
                            <Arrow direction="right" />
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-cloud" />
                            </div>
                        {:else}
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-cloud" />
                            </div>
                            <Arrow direction="right" />
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-server" />
                            </div>
                        {/if}
                    </div>
                    <Button class="u-margin-block-start-48" secondary>
                        {#if isSelfHosted}
                            Deploy to Cloud
                        {:else}
                            Export data
                        {/if}
                    </Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {:else}
        <CardGrid>
            <Heading tag="h3" size="7">Import project data</Heading>
            <p class="text">
                Import data from other products or from a different Appwrite instance
            </p>
            <svelte:fragment slot="aside">
                {#if data.imports.length}
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
                            {#each data.imports as entry}
                                <TableRow>
                                    {@const source = capitalize(JSON.parse(entry.source).type)}
                                    {@const status = getStatus(entry.status)}
                                    <TableCell title="Data">
                                        {isSameDay(new Date(), new Date(entry.$createdAt))
                                            ? 'Today'
                                            : toLocaleDate(entry.$createdAt)}
                                    </TableCell>
                                    <TableCell title="Source">{source}</TableCell>
                                    <TableCell title="Status">
                                        <div class="u-flex u-gap-4 u-cross-center">
                                            <i class="icon-{status.icon}" />
                                            <span>{status.text}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell title="">
                                        <Button secondary on:click={() => (showDetails = true)}
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
                        <Button
                            class="u-margin-block-start-20"
                            secondary
                            on:click={openImportWizard}>
                            Import data
                        </Button>
                    </div>
                {/if}
            </svelte:fragment>
        </CardGrid>
        <CardGrid>
            <Heading tag="h3" size="7">Export to self-hosted instance</Heading>
            <p class="text">Export data from your project to a self-hosted instance</p>
            <svelte:fragment slot="aside">
                <div class="import-box">
                    <div class="u-flex u-cross-center u-gap-8">
                        {#if isSelfHosted}
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-server" />
                            </div>
                            <Arrow direction="right" />
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-cloud" />
                            </div>
                        {:else}
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-cloud" />
                            </div>
                            <Arrow direction="right" />
                            <div class="avatar" style="--size: {48 / 16}rem">
                                <span class="icon-server" />
                            </div>
                        {/if}
                    </div>
                    <Button class="u-margin-block-start-48" secondary>
                        {#if isSelfHosted}
                            Deploy to Cloud
                        {:else}
                            Export data
                        {/if}
                    </Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Details bind:show={showDetails} />

<style lang="scss">
    .import-box {
        display: grid;
        place-items: center;

        border: 1px dashed hsl(var(--color-border));
        /* border-color: red; */
        border-radius: 1rem;

        height: 100%;

        padding: 1.5rem;
    }
</style>
