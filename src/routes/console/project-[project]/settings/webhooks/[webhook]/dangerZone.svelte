<script lang="ts">
    import { Box, CardGrid, Heading } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { webhook } from './store';
    import Delete from './delete.svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import LL from '$i18n/i18n-svelte';

    let showDelete = false;
</script>

<CardGrid danger>
    <div>
        <Heading tag="h2" size="7">{$LL.console.project.title.deleteWebhook()}</Heading>
    </div>
    <p>{$LL.console.project.texts.webhooks.deletePermanently()}</p>
    <svelte:fragment slot="aside">
        <Box>
            <svelte:fragment slot="title">
                <h6 class="u-bold u-trim-1">{$webhook.name}</h6>
            </svelte:fragment>
            <p>
                {$LL.console.project.texts.webhooks.lastUpdated()}{' '}{toLocaleDateTime(
                    $webhook.$updatedAt
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
