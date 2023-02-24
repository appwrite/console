<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import { Empty, CardContainer, Copy, GridItem1, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { app } from '$lib/stores/app';
    import { wizard } from '$lib/stores/wizard';
    import { beforeNavigate } from '$app/navigation';
    import Create from '../createTransfer.svelte';
    import type { PageData } from './$types';
    import { CARD_LIMIT } from '$lib/constants';

    export let data: PageData;

    let offset = 0;

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
        <CardContainer
            {offset}
            event="transfers"
            total={data.transfers.total}
            on:click={openWizard}>
            {#each data.transfers.transfers as transfer}
                <GridItem1
                    href={`${base}/console/project-${project}/settings/transfers/transfer-${transfer.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-16 u-cross-center">
                            <div class="avatar is-medium">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/appwrite.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">{transfer.$id}</span>
                        </div>
                    </svelte:fragment>

                    <Copy value={transfer.$id} event="transfer">
                        <Pill button><i class="icon-duplicate" />Transfer ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new transfer</p>
            </svelte:fragment>
        </CardContainer>
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
