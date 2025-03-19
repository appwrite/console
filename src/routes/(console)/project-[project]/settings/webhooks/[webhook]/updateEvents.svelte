<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Empty, EventModal } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
    import { webhook } from './store';
    import { Icon, Layout, Link, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    const projectId = $page.params.project;
    const eventSet: Writable<Set<string>> = writable(new Set());

    let showCreateEvent = false;
    let areEventsDisabled = true;

    onMount(async () => {
        $eventSet = new Set($webhook.events);
    });

    async function updateEvents() {
        try {
            await sdk.forConsole.projects.updateWebhook(
                projectId,
                $webhook.$id,
                $webhook.name,
                Array.from($eventSet),
                $webhook.url,
                $webhook.security,
                true,
                $webhook.httpUser || undefined,
                $webhook.httpPass || undefined
            );
            await invalidate(Dependencies.WEBHOOK);
            areEventsDisabled = true;
            addNotification({
                type: 'success',
                message: 'Webhook events have been updated'
            });
            trackEvent(Submit.WebhookUpdateEvents, {
                events: Array.from($eventSet)
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.WebhookUpdateEvents);
        }
    }

    function handleEvent(event: CustomEvent) {
        eventSet.set($eventSet.add(event.detail));
    }

    $: if ($eventSet) {
        if (symmetricDifference(Array.from($eventSet), $webhook.events).length) {
            areEventsDisabled = false;
        } else areEventsDisabled = true;
    }
</script>

<Form onSubmit={updateEvents}>
    <CardGrid>
        <svelte:fragment slot="title">Events</svelte:fragment>
        Set the events that will trigger your webhook. Maximum 100 events allowed.
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
                    <Button secondary on:click={() => (showCreateEvent = true)}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add event
                    </Button>
                </div>
            {:else}
                <Empty on:click={() => (showCreateEvent = true)}>Add an event</Empty>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={areEventsDisabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<EventModal bind:show={showCreateEvent} on:created={handleEvent}>
    <Typography.Text>
        Select events in your Appwrite project that will trigger your webhook. <Link.Anchor
            href="https://appwrite.io/docs/advanced/platform/events"
            target="_blank"
            rel="noopener noreferrer"
            class="link">Learn more</Link.Anchor>
    </Typography.Text>
</EventModal>
