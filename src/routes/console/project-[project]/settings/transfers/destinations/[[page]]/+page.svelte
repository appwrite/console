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
    import Create from '../../createDestination.svelte';
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
        <Heading tag="h2" size="5">All Destinations</Heading>
        <Button on:click={openWizard} event="create_destination">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">Create destination</span>
        </Button>
    </div>

    {#if data.destinations.total}
        <CardContainer
            {offset}
            event="destinations"
            total={data.destinations.total}
            on:click={openWizard}>
            {#each data.destinations.destinations as destination}
                <GridItem1
                    href={`${base}/console/project-${project}/settings/transfers/destinations/destination-${destination.$id}`}>
                    <svelte:fragment slot="title">
                        <div class="u-flex u-gap-16 u-cross-center">
                            <div class="image-item">
                                <img
                                    src={`${base}/icons/${$app.themeInUse}/color/${destination.type}.svg`}
                                    alt="technology" />
                            </div>
                            <span class="text">{destination.name}</span>
                        </div>
                    </svelte:fragment>

                    <Copy value={destination.$id} event="destinations">
                        <Pill button><i class="icon-duplicate" />Destination ID</Pill>
                    </Copy>
                </GridItem1>
            {/each}
            <svelte:fragment slot="empty">
                <p>Create a new destination</p>
            </svelte:fragment>
        </CardContainer>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.destinations.total}</p>
            <Pagination
                limit={CARD_LIMIT}
                path={`/console/project-${$page.params.project}/destinations`}
                offset={data.offset}
                sum={data.destinations.total} />
        </div>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/transfers#createDestination"
            target="destination"
            on:click={openWizard} />
    {/if}
</Container>
