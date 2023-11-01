<script lang="ts">
    import { page } from '$app/stores';
    import {
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText,
        TableCell,
        TableScroll,
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        SearchQuery,
        PaginationWithLimit,
        Heading,
    } from '$lib/components';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { ID, type Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { writable } from 'svelte/store';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import type { Subscriber } from './+page';

    export let data: PageData;
    let users = writable(new Map<string, Models.User<Models.Preferences>>());
    let selectedSubscriber: Subscriber | null = null;
    let showAdd = false;
    let showDelete = false;

    const project = $page.params.project;

    async function add(event: CustomEvent<string[]>) {
        const userIds = event.detail;

        async function addSubscriber(userId: string) {
            try {
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
                        targetId: userId
                    }
                );
                trackEvent(Submit.MessagingTopicCreate);
                await invalidate(Dependencies.MESSAGING_TOPIC_SUBSCRIBERS);
            } catch (e) {
                trackError(e, Submit.MessagingTopicCreate);
            }
        }

        const promises = userIds.map(addSubscriber);

        await Promise.all(promises);

        showAdd = false;
        addNotification({
            type: 'success',
            message: `Added ${userIds.length} subscriber${userIds.length > 1 ? 's' : ''} to topic}`
        });
    }

    $: console.log($users);
</script>

<Container>
    <div class="u-flex u-flex-vertical">
        <div class="u-flex u-main-space-between">
            <Heading tag="h2" size="5">Subscribers</Heading>
            <div class="is-only-mobile">
                <Button on:click={() => (showAdd = true)} event="create_subscriber">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Create topic</span>
                </Button>
            </div>
        </div>
        <!-- TODO: fix width of search input in mobile -->
        <SearchQuery search={data.search} placeholder="Search by name">
            <div class="u-flex u-gap-16 is-not-mobile">
                <Button on:click={() => (showAdd = true)} event="create_subscriber">
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add subscriber</span>
                </Button>
            </div>
        </SearchQuery>
    </div>
    {#if data.subscribers.total}
        <TableScroll>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead onlyDesktop>Created</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each data.subscribers.subscribers as subscriber}
                    {@const user = data.targetsById.get(subscriber.$id)}
                    <TableRowLink
                        href={`${base}/console/project-${project}/auth/users/user-${user.$id}`}>
                        <!-- <TableCell title="ID">
                            <Id value={topic.$id}>
                                {topic.$id}
                            </Id>
                        </TableCell> -->
                        <TableCell title="Name">
                            {user.name ?? '-'}
                        </TableCell>
                        <TableCellText onlyDesktop title="Created">
                            {toLocaleDateTime(subscriber.$createdAt)}
                        </TableCellText>
                        <TableCell>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                on:click|preventDefault={() => {
                                    selectedSubscriber = subscriber;
                                    showDelete = true;
                                    trackEvent('click_delete_subscriber');
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRowLink>
                {/each}
            </TableBody>
        </TableScroll>

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

<!-- TODO: handle create -->
<!-- <UserModal bind:show={showAdd} on:submit={add} bind:users /> -->
