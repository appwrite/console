<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { createWebhook } from './store';
    import { EventModal } from '$lib/components';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';

    let showCreate = false;

    function handleCreated(event: CustomEvent) {
        console.log('test');
        $createWebhook.events = event.detail;
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Webhook events</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set the events that will trigger your function. Maximum 100 events allowed.
    </svelte:fragment>

    EVENT
    {#if $createWebhook?.events?.length}
        <TableList>
            {#each $createWebhook.events as id}
                <li class="table-row">
                    <TableCellText title="id">
                        {id}
                    </TableCellText>
                    <TableCell showOverflow title="options" width={30}>
                        <button
                            class="button is-text is-only-icon"
                            aria-label="delete id"
                            on:click|preventDefault={() => {
                                $createWebhook.events = $createWebhook.events.filter(
                                    (item) => item !== id
                                );
                                $createWebhook = $createWebhook;
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </TableCell>
                </li>
            {/each}
        </TableList>
    {:else}
        <Empty isButton single on:click={() => (showCreate = !showCreate)}
            >Add a event to get started</Empty>
    {/if}

    <Button text on:click={() => (showCreate = !showCreate)}>
        <span class="icon-plus" aria-hidden="true" />
        <span class="u-text">Add event</span>
    </Button>
</WizardStep>

<EventModal bind:showCreate on:created={handleCreated} />
