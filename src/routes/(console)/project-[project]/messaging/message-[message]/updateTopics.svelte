<script lang="ts">
    import { type Models, MessagingProviderType } from '@appwrite.io/console';
    import { CardGrid, Empty, PaginationInline, EmptySearch } from '$lib/components';
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
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Table, Typography } from '@appwrite.io/pink-svelte';

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
    <CardGrid hideFooter={message.status != 'draft'}>
        <Typography.Title size="s">Topics</Typography.Title>
        <svelte:fragment slot="aside">
            {@const sum = topicIds.length}
            {#if sum}
                <Layout.Stack direction="row-reverse">
                    {#if message.status == 'draft'}
                        <Button
                            secondary
                            on:click={() => {
                                showTopics = true;
                            }}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Add
                        </Button>
                    {/if}
                </Layout.Stack>
                <Table.Root columns={[{ id: 'topic' }, { id: 'actions', width: 40 }]} let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="topic" {root}>Topic</Table.Header.Cell>
                        <Table.Header.Cell column="actions" {root} />
                    </svelte:fragment>
                    {#each topics.slice(offset, offset + limit) as topic (topic.$id)}
                        <Table.Row.Base {root}>
                            <Table.Cell column="topic" {root}>
                                {topic.name}
                                ({getTotal(topic)} targets)
                            </Table.Cell>
                            <Table.Cell column="actions" {root}>
                                {#if message.status === 'draft'}
                                    <div class="u-flex u-main-end" style="--p-button-size: 1.25rem">
                                        <Button
                                            text
                                            class="is-only-icon"
                                            ariaLabel="delete"
                                            disabled={message.status != 'draft'}
                                            on:click={() => removeTopic(topic.$id)}>
                                            <span
                                                class="icon-x u-font-size-20"
                                                aria-hidden="true" />
                                        </Button>
                                    </div>
                                {/if}
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
                {#if sum > limit}
                    <div class="u-flex u-main-space-between">
                        <p class="text">Total topics: {sum}</p>
                        <PaginationInline {sum} {limit} bind:offset />
                    </div>
                {/if}
            {:else if message.status == 'draft'}
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
