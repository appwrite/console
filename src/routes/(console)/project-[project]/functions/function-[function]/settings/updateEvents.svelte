<script lang="ts">
    import CardGrid from '$lib/components/cardGrid.svelte';
    import Empty from '$lib/components/empty.svelte';
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import Form from '$lib/elements/forms/form.svelte';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { writable, type Writable } from 'svelte/store';
    import { func } from '../store';
    import { EventModal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Link, Table, Typography } from '@appwrite.io/pink-svelte';

    const functionId = $page.params.function;
    const eventSet: Writable<Set<string>> = writable(new Set($func.events));
    let showEvents = false;
    let eventValue: string;
    let isDisabled = true;

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
                $func.providerRootDirectory || undefined
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
        <svelte:fragment slot="title">Events</svelte:fragment>
        Set the events that will trigger your function. Maximum 100 events allowed.
        <svelte:fragment slot="aside">
            {#if $eventSet.size}
                <Table.Root columns={1} let:root>
                    {#each Array.from($eventSet) as event}
                        <Table.Row.Base {root}>
                            <Table.Cell {root}>
                                <Layout.Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center">
                                    {event}
                                    <Button
                                        extraCompact
                                        ariaLabel="delete event"
                                        on:click={() => {
                                            $eventSet.delete(event);
                                            eventSet.set($eventSet);
                                        }}>
                                        <Icon icon={IconX} size="s" />
                                    </Button>
                                </Layout.Stack>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
                <div>
                    <Button secondary on:click={() => (showEvents = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add event
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
    <Typography.Text
        >Select events in your Appwrite project that will trigger your function.
        <Link.Anchor
            href="https://appwrite.io/docs/advanced/platform/events"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more about Appwrite Events</Link.Anchor
        >.</Typography.Text>
</EventModal>
