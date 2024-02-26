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
    import { CardGrid, Heading, Empty, PaginationInline } from '$lib/components';
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

    export let messageId: string;
    export let messageType: MessagingProviderType;
    export let selectedTopicsById: Record<string, Models.Topic>;

    let offset = 0;
    const limit = 10;
    let showTopics = false;
    let topicsById: Record<string, Models.Topic> = {};
    let topicIds: string[] = [];
    let topics: Models.Topic[] = [];
    let disabled = true;

    onMount(() => {
        topicsById = { ...selectedTopicsById };
    });

    function removeTopic(topicId: string) {
        const { [topicId]: _, ...rest } = topicsById;
        topicsById = rest;
    }

    async function update() {
        try {
            if (messageType == MessagingProviderType.Email) {
                await sdk.forProject.messaging.updateEmail(messageId, topicIds);
            } else if (messageType == MessagingProviderType.Sms) {
                await sdk.forProject.messaging.updateSms(messageId, topicIds);
            } else if (messageType == MessagingProviderType.Push) {
                await sdk.forProject.messaging.updatePush(messageId, topicIds);
            }
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: 'Message has been updated',
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
    <CardGrid>
        <Heading tag="h6" size="7" id="variables">Topics</Heading>
        <svelte:fragment slot="aside">
            <div class="u-flex u-cross-center u-main-space-between">
                <div>
                    <span class="eyebrow-heading-3">Topic</span>
                </div>
                <Button
                    text
                    noMargin
                    on:click={() => {
                        showTopics = true;
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add</span>
                </Button>
            </div>
            {@const sum = topicIds.length}
            {#if sum}
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
                                                </span></span>
                                        </div>
                                    </TableCell>
                                    <TableCell title="Remove" width={40}>
                                        <div class="u-flex u-main-end">
                                            <button
                                                class="button is-text is-only-icon"
                                                type="button"
                                                aria-label="delete"
                                                on:click={() => removeTopic(topic.$id)}>
                                                <span
                                                    class="icon-x u-font-size-20"
                                                    aria-hidden="true" />
                                            </button>
                                        </div>
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
            {:else}
                <Empty on:click={() => (showTopics = true)}>Add a Topic</Empty>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<TopicsModal
    providerType={messageType}
    bind:show={showTopics}
    {topicsById}
    on:update={(e) => {
        showTopics = false;
        topicsById = e.detail;
    }} />
