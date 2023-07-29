<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Empty, EventModal, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form } from '$lib/elements/forms';
    import { TableCell, TableCellText, TableList } from '$lib/elements/table';
    import { symmetricDifference } from '$lib/helpers/array';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { writable, type Writable } from 'svelte/store';
    import { webhook } from './store';
    import LL from '$i18n/i18n-svelte';

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
        <Heading tag="h6" size="7">{$LL.console.project.title.events()}</Heading>
        <p class="text">
            {$LL.console.project.texts.webhooks.triggerWebhook()}
        </p>
        <svelte:fragment slot="aside">
            {#if $eventSet.size}
                <TableList>
                    {#each Array.from($eventSet) as event}
                        <li class="table-row">
                            <TableCellText title="id">
                                {event}
                            </TableCellText>
                            <TableCell showOverflow title="options" width={40}>
                                <button
                                    class="button is-text is-only-icon"
                                    aria-label="delete id"
                                    on:click|preventDefault={() => {
                                        $eventSet.delete(event);
                                        eventSet.set($eventSet);
                                    }}>
                                    <span class="icon-x" aria-hidden="true" />
                                </button>
                            </TableCell>
                        </li>
                    {/each}
                </TableList>
                <div class="u-flex u-margin-block-start-16">
                    <Button text noMargin on:click={() => (showCreateEvent = true)}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="u-text">{$LL.console.project.button.addEvent()}</span>
                    </Button>
                </div>
            {:else}
                <Empty on:click={() => (showCreateEvent = true)}
                    >{$LL.console.project.texts.webhooks.addEvent()}</Empty>
            {/if}
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={areEventsDisabled} submit
                >{$LL.console.project.submit.update()}</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<EventModal bind:show={showCreateEvent} on:created={handleEvent}>
    <p class="text">
        {$LL.console.project.texts.webhooks.selectEvent()}
        <a
            href="https://appwrite.io/docs/events"
            target="_blank"
            rel="noopener noreferrer"
            class="link">{$LL.console.project.texts.webhooks.learnMore()}</a
        >.
    </p>
</EventModal>
