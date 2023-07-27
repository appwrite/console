<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { collection } from '../store';
    import Delete from './deleteCollection.svelte';
    import LL from '$i18n/i18n-svelte';

    let showDelete = false;
</script>

<CardGrid danger>
    <Heading tag="h6" size="7">{$LL.console.project.title.deleteCollection()}</Heading>
    <p>
        {$LL.console.project.texts.databases.deleteCollection()}
    </p>
    <svelte:fragment slot="aside">
        <Box>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$collection.name}</h6>
            </svelte:fragment>
            <p>
                {$LL.console.project.texts.databases.lastUpdated()}{' '}{toLocaleDateTime(
                    $collection.$updatedAt
                )}
            </p>
        </Box>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button secondary on:click={() => (showDelete = true)}
            >{$LL.console.project.button.submit.delete()}</Button>
    </svelte:fragment>
</CardGrid>

<Delete bind:showDelete />
