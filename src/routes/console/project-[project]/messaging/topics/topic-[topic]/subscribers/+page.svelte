<script lang="ts">
    import { page } from '$app/stores';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
        ViewSelector
    } from '$lib/components';
    import { Container } from '$lib/layout';
    import { ID } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import Table from './table.svelte';
    import { type Target, targetsById } from '../../../store';
    import UserTargetsModal from '../../../userTargetsModal.svelte';
    import { onMount } from 'svelte';
    import type { Subscriber } from './+page';
    import Filters from '$lib/components/filters/filters.svelte';
    import { columns } from './store';
    import { View } from '$lib/helpers/load';

    export let data: PageData;
    let showAdd = false;
    let subscribersByTargetId: Record<string, Subscriber> = {};

    onMount(() => {
        $targetsById = {};
        for (const subscriber of $page.data.subscribers.subscribers) {
            const { target } = subscriber;
            $targetsById[target.$id] = target;
            subscribersByTargetId[target.$id] = subscriber;
        }
    });

    async function addTargets(event: CustomEvent<Record<string, Target>>) {
        showAdd = false;
        $targetsById = event.detail;
        async function addSubscriber(targetId: string) {
            await sdk.forProject.client.call(
                'POST',
                new URL(
                    `${sdk.forProject.client.config.endpoint}/messaging/topics/${$page.params.topic}/subscribers`
                ),
                {
                    'X-Appwrite-Project': sdk.forProject.client.config.project,
                    'content-type': 'application/json',
                    'X-Appwrite-Mode': 'admin'
                },
                {
                    subscriberId: ID.unique(),
                    topicId: $page.params.topic,
                    targetId: targetId
                }
            );
        }

        const targetIds = Object.keys($targetsById).filter(
            (targetId) => !(targetId in subscribersByTargetId)
        );
        const promises = targetIds.map(addSubscriber);

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
            <Heading tag="h2" size="5">Subscribers</Heading>
            <div class="is-only-mobile">
                <Button on:click={() => (showAdd = true)} event="create_subscriber">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add subscriber</span>
                </Button>
            </div>
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search by name">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Filters query={data.query} {columns} />
                <ViewSelector
                    view={View.Table}
                    {columns}
                    hideView
                    allowNoColumns
                    showColsTextMobile />
                <Button on:click={() => (showAdd = true)} event="create_subscriber">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add subscriber</span>
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
                    allowNoColumns
                    showColsTextMobile />
            </div>
            <div class="u-flex-basis-50-percent">
                <!-- TODO: fix width -->
                <Filters query={data.query} {columns} />
            </div>
        </div>
    </div>
    {#if data.subscribers.total}
        <Table {data} />

        <PaginationWithLimit
            name="Subscribers"
            limit={data.limit}
            offset={data.offset}
            total={data.subscribers.total} />
        <!-- TODO: remove data.search != 'empty' when the API is ready with data -->
    {:else if data.search && data.search != 'empty'}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find '{data.search}'</b>
                <p>There are no subscribers that match your search.</p>
            </div>
            <Button
                secondary
                href={`/console/project-${$page.params.project}/messaging/topics/topic-${$page.params.topic}/subscribers`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <!-- TODO: update docs link -->
        <Empty
            single
            on:click={() => (showAdd = true)}
            href="https://appwrite.io/docs/references/cloud/client-web/teams"
            target="subscriber" />
    {/if}
</Container>

<UserTargetsModal bind:show={showAdd} bind:targetsById={$targetsById} on:update={addTargets} />
