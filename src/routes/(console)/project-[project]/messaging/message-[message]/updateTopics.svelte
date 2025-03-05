<script lang="ts">
    import { type Models, MessagingProviderType } from '@appwrite.io/console';
    import {
        Table,
        TableBody,
        TableCell,
        TableCellHead,
        TableHeader,
        TableRow
    } from '$lib/elements/table';
    import { CardGrid, Heading, Empty, PaginationInline, EmptySearch } from '$lib/components';
    import TopicsModal from '../topicsModal.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { symmetricDifference } from '$lib/helpers/array';
    import { Form, Button } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { getTotal } from '../wizard/store';
    import { isValueOfStringEnum } from '$lib/helpers/types';

    export let message: Models.Message;
    export let selectedTopicsById: Record<string, Models.Topic>;

    let providerType: MessagingProviderType;
    let offset = 0;
    const limit = 10;
    let showTopics = false;
    let topicsById: Record<string, Models.Topic> = {};
    let topicIds: string[] = [];
    let topics: Models.Topic[] = [];
    let disabled = true;

    if (isValueOfStringEnum(MessagingProviderType, message.providerType)) {
        providerType = message.providerType;
    }

    onMount(() => {
        topicsById = { ...selectedTopicsById };
    });

    function removeTopic(topicId: string) {
        const { [topicId]: _, ...rest } = topicsById;
        topicsById = rest;
    }

    async function update() {
        try {
            if (message.providerType == MessagingProviderType.Email) {
                await sdk.forProject.messaging.updateEmail(message.$id, topicIds);
            } else if (message.providerType == MessagingProviderType.Sms) {
                await sdk.forProject.messaging.updateSms(message.$id, topicIds);
            } else if (message.providerType == MessagingProviderType.Push) {
                await sdk.forProject.messaging.updatePush(message.$id, topicIds);
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: 'Topics have been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingMessageUpdate);
        }
    }

    $: {
        topicIds = [];
        topics = [];
        for (const topicId in topicsById) {
            topicIds.push(topicId);
            topics.push(topicsById[topicId]);
        }
    }

    $: disabled = symmetricDifference(topicIds, Object.keys(selectedTopicsById)).length === 0;
</script>

<Form onSubmit={update}>
    <CardGrid hideFooter={message.status !== 'draft'}>
        <Heading tag="h6" size="7" id="variables">Topics</Heading>
        <svelte:fragment slot="aside">
            {@const sum = topicIds.length}
            {#if sum}
                <div class="u-flex u-cross-center u-main-space-between">
                    <div>
                        <span class="eyebrow-heading-3">Topic</span>
                    </div>
                    {#if message.status === 'draft'}
                        <Button
                            text
                            noMargin
                            on:click={() => {
                                showTopics = true;
                            }}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Add</span>
                        </Button>
                    {/if}
                </div>
                <div class="u-flex u-flex-vertical u-gap-24">
                    <Table noMargin noStyles>
                        <TableHeader>
                            <TableCellHead style="padding: 0" />
                            <TableCellHead width={40} style="padding: 0" />
                        </TableHeader>
                        <TableBody>
                            {#each topics.slice(offset, offset + limit) as topic (topic.$id)}
                                <TableRow>
                                    <TableCell title="Topic">
                                        <div class="u-flex u-cross-center">
                                            <span class="title">
                                                <span class="u-line-height-1-5">
                                                    <span class="body-text-2 u-bold" data-private>
                                                        {topic.name}
                                                    </span>
                                                    <span class="collapsible-button-optional">
                                                        ({getTotal(topic)} targets)
                                                    </span>
                                                </span>
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell title="Remove" width={40}>
                                        {#if message.status === 'draft'}
                                            <div
                                                class="u-flex u-main-end"
                                                style="--p-button-size: 1.25rem">
                                                <Button
                                                    text
                                                    class="is-only-icon"
                                                    ariaLabel="delete"
                                                    disabled={message.status !== 'draft'}
                                                    on:click={() => removeTopic(topic.$id)}>
                                                    <span
                                                        class="icon-x u-font-size-20"
                                                        aria-hidden="true" />
                                                </Button>
                                            </div>
                                        {/if}
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                    <div class="u-flex u-main-space-between">
                        <p class="text">Total topics: {sum}</p>
                        <PaginationInline {sum} {limit} bind:offset />
                    </div>
                </div>
            {:else if message.status === 'draft'}
                <Empty on:click={() => (showTopics = true)}>Add a topic</Empty>
            {:else}
                <EmptySearch hidePagination>
                    <div class="u-text-center">
                        No topics have been selected.
                        <p>
                            Need a hand? Check out our <Button
                                link
                                external
                                href="https://appwrite.io/docs/products/messaging/topics"
                                text>
                                documentation</Button
                            >.
                        </p>
                    </div>
                </EmptySearch>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<TopicsModal
    {providerType}
    bind:show={showTopics}
    {topicsById}
    on:update={(e) => {
        showTopics = false;
        topicsById = e.detail;
    }} />
