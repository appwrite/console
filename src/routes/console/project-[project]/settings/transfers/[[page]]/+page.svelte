<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Empty, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';
    import Create from '../createTransfer.svelte';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';
    import {
        Table,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCell,
        TableHeader
    } from '$lib/elements/table';

    export let data: PageData;

    const project = $page.params.project;

    function openWizard() {
        wizard.start(Create);
    }

    beforeNavigate(() => {
        wizard.hide();
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <Heading tag="h2" size="5">Transfers</Heading>
        <Button on:click={openWizard} event="create_source">
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create transfer</span>
        </Button>
    </div>

    {#if data.transfers.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Providers</TableCellHead>
                <TableCellHead>Status</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.transfers.transfers as transfer}
                    <TableRowLink
                        href={`${base}/console/project-${project}/settings/transfers/transfer-${transfer.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-main-space-between">
                                {transfer.$id}
                            </div>
                        </TableCell>
                        <TableCell title="Providers">
                            <div class="grid-box u-flex">
                                <div class="image-item">
                                    <img
                                        src={`${base}/icons/${$app.themeInUse}/color/supabase.svg`}
                                        alt="technology" />
                                </div>
                                <span class="icon-arrow-right" style="align-self: center;" />
                                <div class="image-item">
                                    <img
                                        src={`${base}/icons/${$app.themeInUse}/color/appwrite.svg`}
                                        alt="technology" />
                                </div>
                            </div>
                        </TableCell>
                        <TableCell title="Status">
                            <Pill><span class="u-capitalize">{transfer.status}</span></Pill>
                        </TableCell>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>

        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.transfers.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/transfers`}
                offset={data.offset}
                sum={data.transfers.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/transfers#createTransfer"
            target="transfer"
            on:click={openWizard} />
    {/if}
</Container>
