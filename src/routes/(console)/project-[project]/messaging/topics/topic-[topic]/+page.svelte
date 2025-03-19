<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        ViewSelector,
        EmptyFilter
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { ID, type Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Click, Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Table from './table.svelte';
    import { targetsById } from '../../store';
    import UserTargetsModal from '../../userTargetsModal.svelte';
    import { onMount } from 'svelte';
    import { Filters, hasPageQueries } from '$lib/components/filters';
    import { View } from '$lib/helpers/load';
    import { writable } from 'svelte/store';
    import type { Column } from '$lib/helpers/types';
    import { base } from '$app/paths';
    import { Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;
    let showAdd = false;
    let subscribersByTargetId: Record<string, Models.Subscriber> = {};
    const columns = writable<Column[]>([
        { id: '$id', title: 'Subscriber ID', type: 'string', show: true, width: 140 },
        { id: 'userName', title: 'Name', type: 'string', show: true, filter: false, width: 100 },
        { id: 'targetId', title: 'Target ID', type: 'string', show: true, width: 140 },
        { id: 'target', title: 'Target', type: 'string', show: true, filter: false, width: 140 },
        { id: 'type', title: 'Type', type: 'string', show: true, width: 80 },
        { id: '$createdAt', title: 'Created', type: 'datetime', show: true, width: 100 }
    ]);

    onMount(() => {
        $targetsById = {};
        for (const subscriber of $page.data.subscribers.subscribers) {
            const { target } = subscriber;
            $targetsById[target.$id] = target;
            subscribersByTargetId[target.$id] = subscriber;
        }
    });

    async function addTargets(event: CustomEvent<Record<string, Models.Target>>) {
        showAdd = false;
        $targetsById = event.detail;

        const targetIds = Object.keys($targetsById).filter(
            (targetId) => !(targetId in subscribersByTargetId)
        );
        const promises = targetIds.map(async (targetId) => {
            const subscriber = await sdk.forProject.messaging.createSubscriber(
                $page.params.topic,
                ID.unique(),
                targetId
            );
            subscribersByTargetId[targetId] = subscriber;
        });

        try {
            await Promise.all(promises);
            addNotification({
                type: 'success',
                message: `Added ${targetIds.length} subscriber${
                    targetIds.length > 1 ? 's' : ''
                } to topic`
            });
            trackEvent(Submit.MessagingTopicSubscriberAdd);
            await invalidate(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingTopicSubscriberAdd);
        }
    }
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Typography.Title>Subscribers</Typography.Title>
            <div class="is-only-mobile">
                <Button
                    on:click={() => {
                        showAdd = true;
                        trackEvent(Click.MessagingTargetCreateClick);
                    }}
                    event="create_subscriber">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add subscriber
                </Button>
            </div>
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery
            search={data.search}
            placeholder="Search by subscriber ID, target ID, user ID, or type">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} analyticsSource="messaging_topics" />
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns />
                <Button on:click={() => (showAdd = true)} event="create_subscriber">
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add subscriber
                </Button>
            </div>
        </SearchQuery>
        <div class="u-flex u-gap-16 is-only-mobile u-margin-block-start-16">
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns />
            </div>
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <Filters query={data.query} {columns} analyticsSource="messaging_topics" />
            </div>
        </div>
    </div>
    {#if data.subscribers.total}
        <Table columns={$columns} {data} />

        <PaginationWithLimit
            name="Subscribers"
            limit={data.limit}
            offset={data.offset}
            total={data.subscribers.total} />
    {:else if $hasPageQueries}
        <EmptyFilter resource="subscribers" />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no subscribers that match your search.</p>
            </div>
            <Button
                secondary
                href={`${base}/project-${$page.params.project}/messaging/topics/topic-${$page.params.topic}/subscribers`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            on:click={() => (showAdd = true)}
            href="https://appwrite.io/docs/products/messaging/topics#subscribe-targets-to-topics"
            target="subscriber" />
    {/if}
</Container>

<UserTargetsModal
    title="Select subscribers"
    bind:show={showAdd}
    bind:targetsById={$targetsById}
    on:update={addTargets}>
    <svelte:fragment slot="description">
        <p class="text">
            Add subscribers to this topic by selecting the targets for directing messages. <a
                href="https://appwrite.io/docs/products/messaging/topics#subscribe-targets-to-topics"
                target="_blank"
                rel="noopener noreferrer"
                class="link">Learn more about subscribers</a
            >.
        </p>
    </svelte:fragment>
</UserTargetsModal>
