<script lang="ts">
    import { EmptySearch, Modal, PaginationInline } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { MessagingProviderType, type Models, Query } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { getTotal } from './wizard/store';
    import {
        Badge,
        Card,
        Empty,
        Layout,
        Selector,
        Table,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { getProviderText } from './helper';

    export let providerType: MessagingProviderType;
    export let show: boolean;
    export let topicsById: Record<string, Models.Topic>;
    export let title = 'Select topics';

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let totalResults = 0;
    let topicResultsById: Record<string, Models.Topic> = {}; // use a hash map so we can quickly look up a user by id
    let selected: Record<string, Models.Topic> = {};
    let hasSelection = false;

    let emptyTopicsExists = false;

    function reset() {
        offset = 0;
        search = '';
    }

    function submit() {
        dispatch('update', selected);
        reset();
    }

    async function request() {
        if (!show) return;
        const queries = [Query.limit(5), Query.offset(offset)];

        const response = await sdk.forProject.messaging.listTopics(queries, search || undefined);

        if (response.total !== 0) {
            switch (providerType) {
                case MessagingProviderType.Email:
                    emptyTopicsExists = response.topics.every((topic) => topic.emailTotal === 0);
                    break;
                case MessagingProviderType.Sms:
                    emptyTopicsExists = response.topics.every((topic) => topic.smsTotal === 0);
                    break;
                case MessagingProviderType.Push:
                    emptyTopicsExists = response.topics.every((topic) => topic.pushTotal === 0);
                    break;
            }
        }

        totalResults = response.total;
        topicResultsById = {};
        response.topics.forEach((topic) => {
            topicResultsById = {
                ...topicResultsById,
                [topic.$id]: topic
            };
        });
    }

    function onTopicSelection(event: CustomEvent<boolean>, topic: Models.Topic) {
        if (event.detail) {
            selected = {
                ...selected,
                [topic.$id]: topic
            };
        } else {
            const { [topic.$id]: _, ...rest } = selected;
            selected = rest;
        }
    }

    $: if (show) {
        request();
    }
    $: if (offset !== null) {
        request();
    }
    $: if (search !== null) {
        offset = 0;
        request();
    }

    $: selectedSize = Object.keys(selected).length;

    $: hasSelection = selectedSize > 0;

    $: if (show) {
        selected = topicsById;
    }
</script>

<Modal {title} bind:show onSubmit={submit} on:close={reset}>
    <Typography.Text>
        Select existing topics you want to send this message to its targets. The message will be
        sent only to {getProviderText(providerType)} targets.
    </Typography.Text>
    <Layout.Stack>
        <InputSearch
            autofocus
            disabled={totalResults === 0 && !search}
            placeholder="Search for topics"
            bind:value={search} />
        {#if Object.keys(topicResultsById).length > 0 && !emptyTopicsExists}
            <Table.Root columns={1} let:root>
                {#each Object.entries(topicResultsById) as [topicId, topic]}
                    <Table.Row.Base {root}>
                        <Table.Cell {root}>
                            <Layout.Stack direction="row" alignItems="center" gap="s">
                                <Selector.Checkbox
                                    id={topicId}
                                    label={topic.name}
                                    disabled={!!topicsById[topicId]}
                                    checked={!!selected[topicId]}
                                    on:change={(event) => onTopicSelection(event, topic)}>
                                </Selector.Checkbox>
                                <span>
                                    ({getTotal(topic)} targets)
                                </span>
                            </Layout.Stack>
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
            <div class="u-flex u-main-space-between u-cross-center">
                <p class="text">Total results: {totalResults}</p>
                <PaginationInline limit={5} bind:offset sum={totalResults} hidePages />
            </div>
        {:else if search}
            <EmptySearch hidePagination {search}>
                <Button size="s" secondary external on:click={() => (search = '')}>
                    Clear search
                </Button>
            </EmptySearch>
        {:else}
            <Card.Base padding="none">
                <Empty
                    type="secondary"
                    title={`You have no topics${
                        emptyTopicsExists ? ` with ${providerType.toUpperCase()} targets` : ''
                    }`}
                    description={`Create a topic to see them here.`}>
                    <Button
                        size="s"
                        slot="actions"
                        secondary
                        external
                        href="https://appwrite.io/docs/products/messaging/topics"
                        >Documentation</Button>
                </Empty>
            </Card.Base>
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Layout.Stack inline direction="row" gap="xs" alignItems="center">
                <Badge variant="secondary" content={selectedSize.toString()} />
                <span>Topics selected</span>
            </Layout.Stack>
            <Button submit disabled={!hasSelection}>Add</Button>
        </Layout.Stack>
    </svelte:fragment>
</Modal>
