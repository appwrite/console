<script lang="ts">
    import { base } from '$app/paths';
    import { Box, CardGrid } from '$lib/components';
    import Heading from '$lib/components/heading.svelte';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import { destination } from '../store';
    import Delete from './delete.svelte';

    let showDelete = false;
</script>

<Container>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <div class="image-item">
                <img
                    src={`${base}/icons/${$app.themeInUse}/color/${$destination.type}.svg`}
                    alt={`${$destination.type} Logo`} />
            </div>
            <div>
                <Heading tag="h6" size="7">{$destination.$id}</Heading>

                <p class="text u-capitalize">{$destination.type}</p>
            </div>
        </div>
        <svelte:fragment slot="aside">
            <div class="u-flex u-main-space-between">
                <div>
                    <p>Destination ID: {$destination.$id}</p>
                    <p>Created at: {toLocaleDateTime($destination.$createdAt)}</p>
                    <p>Updated at: {toLocaleDateTime($destination.$updatedAt)}</p>
                </div>
            </div>
        </svelte:fragment>
    </CardGrid>

    <CardGrid danger>
        <Heading tag="h6" size="7">Delete Destination</Heading>
        <p>The destination will be permanently deleted, This action is irreversible.</p>
        <svelte:fragment slot="aside">
            <Box>
                <svelte:fragment slot="title">
                    <h6 class="u-bold u-trim-1">{$destination.$id}</h6>
                </svelte:fragment>
                <p>Last Updated: {toLocaleDateTime($destination.$updatedAt)}</p>
            </Box>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
        </svelte:fragment>
    </CardGrid>
</Container>

<Delete bind:showDelete />
