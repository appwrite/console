<script lang="ts">
    import { base } from '$app/paths';
    import { Box, CardGrid } from '$lib/components';
    import Card from '$lib/components/card.svelte';
    import Heading from '$lib/components/heading.svelte';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { project } from '../../../../store';
    import { transfer } from '../store';
    import type { PageData } from './$types';
    import Delete from './delete.svelte';

    export let data: PageData;

    let showDelete = false;
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <div class="image-item">
                <span class="icon-text"> 🛫 </span>
            </div>
            <div>
                <Heading tag="h6" size="7">{$transfer.$id}</Heading>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div class="u-flex u-main-space-between">
                <div>
                    <p>Transfer ID: {$transfer.$id}</p>
                    <p>Created at: {toLocaleDateTime($transfer.$createdAt)}</p>
                    <p>Updated at: {toLocaleDateTime($transfer.$updatedAt)}</p>
                </div>
            </div>
        </svelte:fragment>
    </CardGrid>

    <Card>
        <div class="grid-box u-flex">
            {#if data.source}
                <a
                    class="u-stretch u-flex u-cross-center u-gap-16 card"
                    href={`/console/project-${$project.$id}/settings/transfers/sources/source-${data.source.$id}`}>
                    <div class="image-item">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${data.source.type}.svg`}
                            alt="technology" />
                    </div>
                    <div>
                        <Heading tag="h6" size="7">{data.source.name}</Heading>

                        <p class="text u-capitalize">
                            {data.source.type}
                        </p>
                    </div>
                </a>
            {:else}
                <div class="u-stretch u-flex u-cross-center u-gap-16 card">
                    <div class="image-item">
                        <span class="icon-question-mark-circle" />
                    </div>
                    <div>
                        <Heading tag="h6" size="7">Deleted Source</Heading>

                        <p class="text u-capitalize">Unknown</p>
                    </div>
                </div>
            {/if}
            <span class="icon-arrow-right" style="align-self: center;" />
            {#if data.destination}
                <a
                    class="u-stretch u-flex u-cross-center u-gap-16 card"
                    href={`/console/project-${$project.$id}/settings/transfers/destinations/destination-${data.destination.$id}`}>
                    <div class="image-item">
                        <img
                            src={`${base}/icons/${$app.themeInUse}/color/${data.destination.type}.svg`}
                            alt="destination provider" />
                    </div>
                    <div>
                        <Heading tag="h6" size="7">{data.destination.name}</Heading>

                        <p class="text u-capitalize">
                            {data.destination.type}
                        </p>
                    </div>
                </a>
            {:else}
                <div class="u-stretch u-flex u-cross-center u-gap-16 card">
                    <div class="image-item">
                        <span class="icon-question-mark-circle" />
                    </div>
                    <div>
                        <Heading tag="h6" size="7">Deleted Destination</Heading>

                        <p class="text u-capitalize">Unknown</p>
                    </div>
                </div>
            {/if}
        </div>
    </Card>

    <CardGrid danger>
        <Heading tag="h6" size="7">Delete Transfer</Heading>
        <p>
            The transfer will be permanently deleted, including all in progress transfers associated
            with it. This action is irreversible.
        </p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$transfer.$id}</h6>
                </svelte:fragment>
                <p>Last Updated: {toLocaleDateTime($transfer.$updatedAt)}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
