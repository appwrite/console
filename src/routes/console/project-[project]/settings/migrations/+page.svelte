<script lang="ts">
    import { Arrow, CardGrid, Heading } from '$lib/components';
    import Alert from '$lib/components/alert.svelte';
    import Modal from '$lib/components/modal.svelte';
    import { Button } from '$lib/elements/forms';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
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
    let showCloudExport = false;

    const mockImport = async () => {
        console.log(await sdk.forProject.migrations.list());
    };

    mockImport();

    const getStatus = (status: string) => {
        if (status === 'failed') {
            return { text: 'Failed', icon: 'clock', iconColor: 'blue' };
        }

        return { text: 'Pending', icon: 'clock', iconColor: 'blue' };
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
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-server" />
                        </div>
                        <Arrow direction="right" />
                        <div class="avatar" style="--size: {48 / 16}rem">
                            <span class="icon-cloud" />
                        </div>
                    </div>
                    <Button class="u-margin-block-start-48" secondary>Deploy to Cloud</Button>
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
                        on:click={() => (showCloudExport = true)}>Export data</Button>
                </div>
            </svelte:fragment>
        </CardGrid>
    {/if}
</Container>

<Modal bind:show={showCloudExport}>
    <svelte:fragment slot="header">Export to self-hosted instance</svelte:fragment>
    <div class="modal-contents">
        <Alert standalone>
            <svelte:fragment slot="title">API key creation</svelte:fragment>
            By initiating the transfer, an API key will be automatically generated in the background,
            which you can delete after completion
        </Alert>

        <div class="u-margin-block-start-24">
            <InputText
                label="Endpoint self-hosted instance"
                required
                id="endpoint"
                placeholder="https://[YOUR_APPWRITE_HOSTNAME]" />
        </div>

        <div class="box u-margin-block-start-24">
            <p class="u-bold">
                Share your feedback: why our self-hosted solution works better for you
            </p>
            <p class="u-margin-block-start-8">
                We appreciate your continued support and we understand that our self-hosted solution
                might better fit your needs. To help us improve our Cloud solution, please share why
                it works better for you. Your feedback is important to us and we'll use it to make
                our services better.
            </p>
            <div class="u-margin-block-start-24">
                <InputTextarea id="feedback" label="Your feedback" placeholder="Type here..." />
            </div>
        </div>
    </div>

    <div class="u-flex u-gap-16 u-cross-center" slot="footer">
        <span> You will be redirected to your self-hosted instance </span>

        <Button on:click={() => (showCloudExport = false)}>Continue TODO: SUBMIT</Button>
    </div>
</Modal>

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

    .modal-contents :global(.alert) {
        grid-area: initial !important;
    }
</style>
