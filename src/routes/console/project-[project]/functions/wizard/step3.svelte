<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { createFunction } from './store';
    import { EventModal } from '$lib/components';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';
    import LL from '$i18n/i18n-svelte';

    let showCreate = false;

    let eventSet = new Set<string>();

    function handleCreated(event: CustomEvent) {
        eventSet.add(event.detail);
        $createFunction.events = Array.from(eventSet);
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">{$LL.console.project.title.events()}</svelte:fragment>
    <svelte:fragment slot="subtitle">
        {$LL.console.project.texts.functions.setEvents()}
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
            <Button text noMargin on:click={() => (showCreate = !showCreate)}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="u-text">{$LL.console.project.button.addEvent()}</span>
            </Button>
        </div>
    {:else}
        <Empty on:click={() => (showCreate = !showCreate)}
            >{$LL.console.project.texts.functions.addEvent()}</Empty>
    {/if}
</WizardStep>

{#if showCreate}
    <EventModal bind:show={showCreate} on:created={handleCreated}>
        <p class="text">
            {$LL.console.project.texts.functions.selectEvents()}
            <a
                href="https://appwrite.io/docs/events"
                target="_blank"
                rel="noopener noreferrer"
                class="link">{$LL.console.project.texts.functions.learnMore()}</a
            >.
        </p>
    </EventModal>
{/if}
