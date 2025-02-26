<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { createWebhook } from './store';
    import { EventModal } from '$lib/components';
    import { TableList, TableCellText, TableCell } from '$lib/elements/table';
    import { Icon, Typography, Link, Table, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    let showCreate = false;

    let eventSet = new Set<string>();

    function handleCreated(event: CustomEvent) {
        eventSet.add(event.detail);
        $createWebhook.events = Array.from(eventSet);
    }
</script>

<WizardStep>
    <svelte:fragment slot="title">Webhook events</svelte:fragment>
    <svelte:fragment slot="subtitle">
        Set the events that will trigger your function. Maximum 100 events allowed.
    </svelte:fragment>

    {#if $createWebhook?.events?.length}
        {#each $createWebhook.events as event}
            <Table.Root>
                <Table.Row>
                    <Table.Cell>
                        <Layout.Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center">
                            {event}
                            <Button
                                extraCompact
                                ariaLabel="delete event"
                                on:click={() => {
                                    eventSet.delete(event);
                                    $createWebhook.events = Array.from(eventSet);
                                }}>
                                <Icon icon={IconX} size="s" />
                            </Button>
                        </Layout.Stack>
                    </Table.Cell>
                </Table.Row>
            </Table.Root>
        {/each}
        <div>
            <Button secondary on:click={() => (showCreate = !showCreate)}>
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
        <Typography.Text>
            Select events in your Appwrite project that will trigger your webhook. <Link.Anchor
                href="https://appwrite.io/docs/advanced/platform/events"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more</Link.Anchor>
        </Typography.Text>
    </EventModal>
{/if}
