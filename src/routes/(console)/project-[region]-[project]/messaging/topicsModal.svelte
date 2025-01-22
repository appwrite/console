<script lang="ts">
    import { EmptySearch, Modal, PaginationInline } from '$lib/components';
    import { Button, FormList, InputCheckbox, InputSearch } from '$lib/elements/forms';
    import { Table, TableBody, TableCell, TableRow } from '$lib/elements/table';
    import { sdk } from '$lib/stores/sdk';
    import { MessagingProviderType, type Models, Query } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { getTotal } from './wizard/store';
    import { page } from '$app/stores';
    import ProviderType from './providerType.svelte';

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

        if (providerType === MessagingProviderType.Email) {
            queries.push(Query.greaterThan('emailTotal', 0));
        } else if (providerType === MessagingProviderType.Sms) {
            queries.push(Query.greaterThan('smsTotal', 0));
        } else if (providerType === MessagingProviderType.Push) {
            queries.push(Query.greaterThan('pushTotal', 0));
        }

        const response = await sdk
            .forProject($page.params.region, $page.params.project)
            .messaging.listTopics(queries, search || undefined);

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

    function onTopicSelection(event: Event, topic: Models.Topic) {
        const { checked } = event.currentTarget as HTMLInputElement;

        if (checked) {
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

<Modal {title} bind:show onSubmit={submit} on:close={reset} headerDivider={false} size="big">
    <div class="u-flex u-flex-vertical u-gap-32">
        <p class="text">
            Select existing topics you want to send this message to its targets. The message will be
            sent only to
            <ProviderType type={providerType} noIcon />
            targets.
        </p>
        <div class="u-flex u-flex-vertical u-gap-16">
            <InputSearch
                autofocus
                disabled={totalResults === 0 && !search}
                placeholder="Search for topics"
                bind:value={search} />
            <div>
                {#if Object.keys(topicResultsById).length > 0 && !emptyTopicsExists}
                    <div class="u-flex-vertical u-gap-8">
                        <FormList>
                            <Table noMargin noStyles>
                                <TableBody>
                                    {#each Object.entries(topicResultsById) as [topicId, topic]}
                                        <TableRow>
                                            <TableCell>
                                                <InputCheckbox
                                                    id={topicId}
                                                    disabled={!!topicsById[topicId]}
                                                    checked={!!selected[topicId]}
                                                    on:change={(event) =>
                                                        onTopicSelection(event, topic)}>
                                                    <svelte:fragment slot="description">
                                                        <span class="title">
                                                            <span class="u-line-height-1-5">
                                                                <span
                                                                    class="body-text-1 u-bold"
                                                                    data-private>
                                                                    {topic.name}
                                                                </span>
                                                                <span
                                                                    class="collapsible-button-optional"
                                                                    style="--p-toggle-optional-color: var(--color-neutral-50);">
                                                                    ({getTotal(topic)} targets)
                                                                </span>
                                                            </span></span>
                                                    </svelte:fragment>
                                                </InputCheckbox>
                                            </TableCell>
                                        </TableRow>
                                    {/each}
                                </TableBody>
                            </Table>
                        </FormList>
                        <div class="u-flex u-main-space-between u-cross-center">
                            <p class="text">Total results: {totalResults}</p>
                            <PaginationInline limit={5} bind:offset sum={totalResults} hidePages />
                        </div>
                    </div>
                {:else if search}
                    <EmptySearch hidePagination>
                        <div class="common-section">
                            <div class="u-text-center common-section">
                                <b class="body-text-2 u-bold">Sorry we couldn't find "{search}"</b>
                                <p>There are no topics that match your search.</p>
                            </div>
                            <div class="u-flex u-gap-16 common-section u-main-center">
                                <Button
                                    external
                                    href="https://appwrite.io/docs/products/messaging/topics"
                                    text
                                    >Documentation
                                </Button>
                                <Button secondary on:click={() => (search = '')}
                                    >Clear search
                                </Button>
                            </div>
                        </div>
                    </EmptySearch>
                {:else}
                    <EmptySearch hidePagination>
                        <div class="common-section">
                            <div class="u-text-center common-section">
                                <p class="text u-line-height-1-5">
                                    You have no topics{emptyTopicsExists
                                        ? ` with ${providerType.toUpperCase()} targets`
                                        : ''}. Create a topic to see them here.
                                </p>
                                <p class="text u-line-height-1-5">
                                    Need a hand? Learn more in our
                                    <Button
                                        link
                                        external
                                        href="https://appwrite.io/docs/products/messaging/topics"
                                        >documentation
                                    </Button>
                                    .
                                </p>
                            </div>
                        </div>
                    </EmptySearch>
                {/if}
            </div>
        </div>
    </div>
    <svelte:fragment slot="footer">
        <div class="u-flex u-gap-16 u-cross-center">
            <div class="u-flex u-gap-8">
                <span class="inline-tag"><span class="text">{selectedSize}</span></span>
                <span class="body-text-2">Topics selected</span>
            </div>
            <Button submit disabled={!hasSelection}>Add</Button>
        </div>
    </svelte:fragment>
</Modal>
