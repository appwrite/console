<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { createFunction } from './store';
    import { EventModal } from '$lib/components';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let showCreate = false;

    let eventSet = new Set<string>();

    function handleCreated(event: CustomEvent) {
        eventSet.add(event.detail);
        $createFunction.events = Array.from(eventSet);
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Events</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set the events that will trigger your function. Maximum 100 events allowed.<a
            href="https://appwrite.io/docs/advanced/platform/events"
            target="_blank"
            rel="noopener noreferrer"
            class="link">
            Learn more about events.
        </a>.
    </svelte:fragment>

    {#if $createFunction?.events?.length}
        <TableList>
            {#each $createFunction.events as event}
                <li class="table-row">
                    <TableCellText title="id">
                        {event}
                    </TableCellText>
                    <TableCell showOverflow title="options" width={40}>
                        <button
                            class="button is-text is-only-icon"
                            aria-label="delete id"
                            on:click|preventDefault={() => {
                                eventSet.delete(event);
                                $createFunction.events = Array.from(eventSet);
                            }}>
                            <span class="icon-x" aria-hidden="true" />
                        </button>
                    </TableCell>
                </li>
            {/each}
        </TableList>
        <div class="u-flex u-margin-block-start-16">
            <Button text on:click={() => (showCreate = !showCreate)}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add event
            </Button>
        </div>
    {:else}
        <Empty on:click={() => (showCreate = !showCreate)}>Add an event</Empty>
    {/if}
</WizardStep>

{#if showCreate}
    <EventModal bind:show={showCreate} on:created={handleCreated}>
        <p class="text">
            Select events in your Appwrite project that will trigger your function. <a
                href="https://appwrite.io/docs/advanced/platform/events"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more about Appwrite Events</a
            >.
        </p>
    </EventModal>
{/if}
