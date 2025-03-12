<script lang="ts">
    import CardGrid from '$lib/components/cardGrid.svelte';
    import Empty from '$lib/components/empty.svelte';
    import Heading from '$lib/components/heading.svelte';

    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import Form from '$lib/elements/forms/form.svelte';
    import { TableCell, TableCellText } from '$lib/elements/table';
    import TableList from '$lib/elements/table/tableList.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { writable, type Writable } from 'svelte/store';
    import { func } from '../store';
    import { EventModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import DropList from '$lib/components/dropList.svelte';
    import DropListItem from '$lib/components/dropListItem.svelte';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';

    const functionId = $page.params.function;
    const eventSet: Writable<Set<string>> = writable(new Set($func.events));
    let showEvents = false;
    let eventValue: string;
    let isDisabled = true;
    let showDropdown: boolean[] = [];

    async function updateEvents() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.runtime,
                $func.execute || undefined,
                Array.from($eventSet),
                $func.schedule || undefined,
                $func.timeout || undefined,
                $func.enabled || undefined,
                $func.logging || undefined,
                $func.entrypoint || undefined,
                $func.commands || undefined,
                $func.scopes || undefined,
                $func.installationId || undefined,
                $func.providerRepositoryId || undefined,
                $func.providerBranch || undefined,
                $func.providerSilentMode || undefined,
                $func.providerRootDirectory || undefined,
                $func.specification || undefined
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                message: 'Events have been updated',
                type: 'success'
            });
            trackEvent(Submit.FunctionUpdateEvents);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.FunctionUpdateEvents);
        }
    }

    function handleEvent(event: CustomEvent) {
        if (eventValue) {
            const newSet = new Set(
                [...$eventSet].map((e) => (e === eventValue ? event.detail : e))
            );
            eventSet.set(newSet);
        } else {
            eventSet.set($eventSet.add(event.detail));
        }
        eventValue = null;
    }

    $: if ($eventSet) {
        if (symmetricDifference(Array.from($eventSet), $func.events).length) {
            isDisabled = false;
        } else isDisabled = true;
    }

    $: if (!showEvents) {
        eventValue = undefined;
    }
</script>

<Form onSubmit={updateEvents}>
    <CardGrid>
        <Heading tag="h6" size="7" id="events">Events</Heading>
        <p>Set the events that will trigger your function. Maximum 100 events allowed.</p>
        <svelte:fragment slot="aside">
            {#if $eventSet.size}
                <TableList>
                    {#each Array.from($eventSet) as event, i}
                        <li class="table-row">
                            <TableCellText title="id">
                                {event}
                            </TableCellText>
                            <TableCell showOverflow title="options" width={40}>
                                <DropList
                                    bind:show={showDropdown[i]}
                                    placement="bottom-start"
                                    noArrow>
                                    <button
                                        class="button is-text is-only-icon"
                                        aria-label="more options"
                                        on:click|preventDefault={() =>
                                            (showDropdown[i] = !showDropdown[i])}>
                                        <span class="icon-dots-horizontal" aria-hidden="true" />
                                    </button>
                                    <svelte:fragment slot="list">
                                        <DropListItem
                                            icon="pencil"
                                            on:click={() => {
                                                showDropdown[i] = false;
                                                showEvents = true;
                                                eventValue = event;
                                            }}>
                                            Edit
                                        </DropListItem>
                                        <DropListItem
                                            icon="trash"
                                            on:click={async () => {
                                                $eventSet.delete(event);
                                                eventSet.set($eventSet);
                                            }}>
                                            Delete
                                        </DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        </li>
                    {/each}
                </TableList>

                <div class="u-flex u-margin-block-start-16">
                    <Button text noMargin on:click={() => (showEvents = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="u-text">Add event</span>
                    </Button>
                </div>
            {:else}
                <Empty on:click={() => (showEvents = true)}>Add an event</Empty>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={isDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<EventModal bind:show={showEvents} initialValue={eventValue} on:created={handleEvent}>
    <p class="text">
        Select events in your Appwrite project that will trigger your function. <a
            href="https://appwrite.io/docs/advanced/platform/events"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more about Appwrite Events</a
        >.
    </p>
</EventModal>
