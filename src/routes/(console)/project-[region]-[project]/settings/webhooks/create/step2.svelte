<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { Empty } from '$lib/components';
    import { EventModal } from '$lib/components';
    import { Icon, Typography, Link, Table, Layout, Fieldset } from '@appwrite.io/pink-svelte';
    import { IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';

    let showCreate = false;

    export let events: string[];

    const eventSet = new Set<string>();

    function handleCreated(event: CustomEvent) {
        eventSet.add(event.detail);
        events = Array.from(eventSet);
    }
</script>

<Fieldset legend="Events">
    <Layout.Stack gap="s">
        {#if events.length}
            <Table.Root columns={1} let:root>
                {#each events as event}
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
                                        eventSet.delete(event);
                                        events = Array.from(eventSet);
                                    }}>
                                    <Icon icon={IconX} size="s" />
                                </Button>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            <div>
                <Button secondary on:click={() => (showCreate = !showCreate)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add event
                </Button>
            </div>
        {:else}
            <Empty on:click={() => (showCreate = !showCreate)}>Add an event</Empty>
        {/if}
    </Layout.Stack>
</Fieldset>

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
