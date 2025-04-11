<script lang="ts">
    import {
        Collapsible,
        CollapsibleItem,
        EmptySearch,
        Modal,
        PaginationInline
    } from '$lib/components';
    import { Button, FormList, InputCheckbox, InputSearch } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models, MessagingProviderType } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { page } from '$app/stores';
    import ProviderType from './providerType.svelte';

    export let title: string;
    export let show: boolean;
    export let targetsById: Record<string, Models.Target>;
    export let providerType: MessagingProviderType = null;

    const dispatch = createEventDispatcher();

    let search = '';
    let offset = 0;
    let totalResults = 0;
    let userResultsById: Record<string, Models.User<Record<string, unknown>>> = {}; // use a hash map so we can quickly look up a user by id
    let selected: Record<string, Models.Target> = {};
    let selectedSize = 0;
    let selectedUsers = 0;
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

        if (providerType === MessagingProviderType.Email) {
            queries.push(Query.notEqual('email', ''));
        } else if (providerType === MessagingProviderType.Sms) {
            queries.push(Query.notEqual('phone', ''));
        }

        const response = await sdk
            .forProject($page.params.region, $page.params.project)
            .users.list(queries, search || undefined);

        totalResults = response.total;
        userResultsById = {};
        response.users.forEach((user) => {
            if (providerType !== null) {
                user.targets = user.targets.filter(
                    (target) => target.providerType === providerType
                );
            }
            userResultsById = {
                ...userResultsById,
                [user.$id]: user
            };
        });
    }

    function onUserSelection(event: Event, userId: string) {
        const { checked } = event.currentTarget as HTMLInputElement;

        const user = userResultsById[userId];

        if (checked) {
            user.targets.forEach((target) => {
                selected = {
                    ...selected,
                    [target.$id]: target
                };
            });
        } else {
            user.targets.forEach((target) => {
                const { [target.$id]: _, ...rest } = selected;
                selected = rest;
            });
        }
    }

    function onTargetSelection(event: Event, target: Models.Target) {
        const { checked } = event.currentTarget as HTMLInputElement;

        if (checked) {
            selected = {
                ...selected,
                [target.$id]: target
            };
        } else {
            const { [target.$id]: _, ...rest } = selected;
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

    $: {
        selectedSize = 0;
        const users = new Set();
        for (const s in selected) {
            const target = selected[s];
            users.add(target.userId);
            selectedSize++;
        }
        selectedUsers = users.size;
    }

    $: hasSelection = selectedSize > 0;

    $: if (show) {
        selected = targetsById;
    }
</script>

<Modal {title} bind:show onSubmit={submit} on:close={reset} size="big" headerDivider={false}>
    <div class="u-flex u-flex-vertical u-gap-32">
        <slot name="description" />

        <div class="u-flex u-flex-vertical u-gap-16">
            <InputSearch
                autofocus
                disabled={totalResults === 0 && !search}
                placeholder="Search by name, email, phone or ID"
                bind:value={search} />
            <div>
                {#if Object.keys(userResultsById).length > 0}
                    <div class="u-flex-vertical u-gap-8">
                        <div class="u-sep-block-end">
                            <Collapsible>
                                {#each Object.entries(userResultsById) as [userId, user] (userId)}
                                    {@const selectedCount = user.targets.filter(
                                        (target) => selected[target.$id]
                                    ).length}
                                    <CollapsibleItem
                                        withIndentation
                                        disabled={!user.targets.length}>
                                        <svelte:fragment slot="beforetitle">
                                            <InputCheckbox
                                                id={userId}
                                                size="small"
                                                disabled={!user.targets.length ||
                                                    (user.targets.length > 0 &&
                                                        user.targets.every(
                                                            (target) => targetsById[target.$id]
                                                        ))}
                                                checked={selectedCount > 0 &&
                                                    selectedCount === user.targets.length}
                                                on:change={(event) =>
                                                    onUserSelection(event, userId)} />
                                        </svelte:fragment>
                                        <svelte:fragment slot="title">
                                            <span class="u-line-height-1-5">
                                                <span
                                                    class="user-name body-text-1 u-bold"
                                                    data-private>
                                                    {#if user.name}
                                                        {user.name}
                                                    {:else if user.email}
                                                        {user.email}
                                                    {:else if user.phone}
                                                        {user.phone}
                                                    {:else}
                                                        {userId}
                                                    {/if}
                                                </span>
                                            </span>
                                        </svelte:fragment>
                                        <svelte:fragment slot="subtitle">
                                            {#if user.targets.length === 0}
                                                (0 targets)
                                            {:else}
                                                ({selectedCount}/{user.targets.length} targets)
                                            {/if}
                                        </svelte:fragment>
                                        <FormList>
                                            {#each user.targets as target}
                                                <div class="u-flex">
                                                    <InputCheckbox
                                                        id={target.$id}
                                                        size="small"
                                                        disabled={!!targetsById[target.$id]}
                                                        checked={!!selected[target.$id]}
                                                        on:change={(event) =>
                                                            onTargetSelection(event, target)}>
                                                        <svelte:fragment slot="description">
                                                            <div class="u-inline-flex u-gap-8">
                                                                <span
                                                                    class="inline-tag u-normal u-x-small"
                                                                    ><ProviderType
                                                                        type={target.providerType}
                                                                        noIcon /></span>
                                                                {#if target.providerType !== MessagingProviderType.Push}
                                                                    {target.identifier}
                                                                {:else}
                                                                    {target.name}
                                                                {/if}
                                                            </div>
                                                        </svelte:fragment>
                                                    </InputCheckbox>
                                                </div>
                                            {/each}
                                        </FormList>
                                    </CollapsibleItem>
                                {/each}
                            </Collapsible>
                        </div>
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
                                <p>There are no Users that match your search.</p>
                            </div>
                            <div class="u-flex u-gap-16 common-section u-main-center">
                                <Button
                                    external
                                    href="https://appwrite.io/docs/products/auth/accounts"
                                    text>Documentation</Button>
                                <Button secondary on:click={() => (search = '')}
                                    >Clear search</Button>
                            </div>
                        </div>
                    </EmptySearch>
                {:else}
                    <EmptySearch hidePagination>
                        <div class="common-section">
                            <div class="u-text-center common-section">
                                <p class="text u-line-height-1-5">
                                    You have no users. Create a user to see them here.
                                </p>
                                <p class="text u-line-height-1-5">
                                    Need a hand? Learn more in our <Button
                                        link
                                        external
                                        href="https://appwrite.io/docs/products/auth/quick-start"
                                        >documentation</Button
                                    >.
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
                <span class="inline-tag"><span class="text">{selectedUsers}</span></span>
                <span class="body-text-2">Users selected</span>
            </div>
            <Button submit disabled={!hasSelection}>Add</Button>
        </div>
    </svelte:fragment>
</Modal>

<style lang="scss">
    :global(.collapsible-wrapper:not(.is-disabled)) {
        .user-name {
            color: hsl(var(--color-neutral-80));

            :global(.theme-dark) & {
                color: hsl(var(--color-neutral-20));
            }
        }
    }
</style>
