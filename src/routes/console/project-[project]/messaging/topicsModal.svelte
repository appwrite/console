<script lang="ts">
    import { Button, InputCheckbox, InputSearch } from '$lib/elements/forms';
    import { createEventDispatcher } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Query } from '@appwrite.io/console';
    import { EmptySearch, Modal, PaginationInline } from '$lib/components';
    import type { Topic } from './store';

    export let show: boolean;
    export let topicsById: Record<string, Topic>;
    export let title = 'Select topics';

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let totalResults = 0;
    let topicResultsById: Record<string, Topic> = {}; // use a hash map so we can quickly look up a user by id
    let selected: Record<string, Topic> = {};
    let hasSelection = false;

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

        const params = {
            queries
        };

        if (search) {
            params['search'] = search;
        }

        // TODO: replace with sdk.forProject.users.list once User type has targets
        const response = await sdk.forProject.client.call(
            'GET',
            new URL(sdk.forProject.client.config.endpoint + '/messaging/topics'),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            },
            params
        );

        totalResults = response.total;
        topicResultsById = {};
        response.topics.forEach((topic) => {
            topicResultsById = {
                ...topicResultsById,
                [topic.$id]: topic
            };
        });
    }

    function onTopicSelection(event: Event, topic: Topic) {
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

<Modal {title} bind:show onSubmit={submit} on:close={reset} size="big">
    <p class="text">Select existing topics you want to send this message to its recipients.</p>
    <InputSearch
        autofocus
        disabled={totalResults === 0 && !search}
        placeholder="Search for topics"
        bind:value={search} />
    {#if Object.keys(topicResultsById).length > 0}
        {#each Object.entries(topicResultsById) as [topicId, topic]}
            <InputCheckbox
                id={topicId}
                disabled={!!topicsById[topicId]}
                checked={!!selected[topicId]}
                on:change={(event) => onTopicSelection(event, topic)}>
                <svelte:fragment slot="description">
                    <span class="title"
                        ><span class="u-line-height-1-5">
                            <span class="body-text-2 u-bold" data-private>
                                {topic.name}
                            </span><span class="collapsible-button-optional"
                                >({topic.total} subscribers)</span>
                        </span></span>
                </svelte:fragment>
            </InputCheckbox>
        {/each}
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {totalResults}</p>
            <PaginationInline limit={5} bind:offset sum={totalResults} hidePages />
        </div>
    {:else if search}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <b class="body-text-2 u-bold">Sorry we couldn't find "{search}"</b>
                    <p>There are no topics that match your search.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="https://appwrite.io/docs/products/auth/accounts" text
                        >Documentation</Button>
                    <Button secondary on:click={() => (search = '')}>Clear search</Button>
                </div>
            </div>
        </EmptySearch>
    {:else}
        <EmptySearch hidePages>
            <div class="common-section">
                <div class="u-text-center common-section">
                    <p class="text u-line-height-1-5">
                        You have no topics. Create a topic to see them here.
                    </p>
                    <!-- TODO: link to topics docs -->
                    <p class="text u-line-height-1-5">
                        Need a hand? Learn more in our <a
                            href="https://appwrite.io/docs/products/auth/quick-start"
                            target="_blank"
                            rel="noopener noreferrer">
                            documentation</a
                        >.
                    </p>
                </div>
            </div>
        </EmptySearch>
    {/if}

    <svelte:fragment slot="footer">
        <Button submit disabled={!hasSelection}>Add</Button>
    </svelte:fragment>
</Modal>
