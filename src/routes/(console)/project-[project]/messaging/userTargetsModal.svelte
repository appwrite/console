<script lang="ts">
    import { EmptySearch, Modal, PaginationInline } from '$lib/components';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { sdk } from '$lib/stores/sdk';
    import { Query, type Models, MessagingProviderType } from '@appwrite.io/console';
    import { createEventDispatcher } from 'svelte';
    import { Accordion, Badge, Card, Empty, Layout, Selector } from '@appwrite.io/pink-svelte';
    import { getProviderText } from './helper';
    import { Submit, trackEvent } from '$lib/actions/analytics';

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
        trackEvent(Submit.MessagingTargetUpdate);
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

        const response = await sdk.forProject.users.list(queries, search || undefined);

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

    function onUserSelection(event: CustomEvent<boolean>, userId: string) {
        const user = userResultsById[userId];

        if (event.detail) {
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

    function onTargetSelection(event: CustomEvent<boolean>, target: Models.Target) {
        if (event.detail) {
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

<Modal {title} bind:show onSubmit={submit} on:close={reset}>
    <slot name="description" />
    <Layout.Stack>
        <InputSearch
            autofocus
            disabled={totalResults === 0 && !search}
            placeholder="Search by name, email, phone or ID"
            bind:value={search} />
        {#if Object.keys(userResultsById).length > 0}
            {#each Object.entries(userResultsById) as [userId, user] (userId)}
                {@const selectedCount = user.targets.filter(
                    (target) => selected[target.$id]
                ).length}
                <Accordion
                    selectable
                    title={user.name
                        ? user.name
                        : user.email
                          ? user.email
                          : user.phone
                            ? user.phone
                            : userId}
                    badge={user.targets.length === 0
                        ? '0 targets'
                        : `${selectedCount}/${user.targets.length} targets`}
                    disabled={!user.targets.length}
                    checked={selectedCount > 0 && selectedCount === user.targets.length}
                    on:change={(event) => onUserSelection(event, userId)}>
                    {#each user.targets as target}
                        <Layout.Stack direction="row">
                            <Selector.Checkbox
                                id={target.$id}
                                size="s"
                                checked={!!selected[target.$id]}
                                on:change={(event) => onTargetSelection(event, target)}>
                            </Selector.Checkbox>
                            <div class="u-inline-flex u-gap-8">
                                <Badge
                                    size="xs"
                                    variant="secondary"
                                    content={getProviderText(target.providerType)} />
                                {#if target.providerType !== MessagingProviderType.Push}
                                    {target.identifier}
                                {:else}
                                    {target.name}
                                {/if}
                            </div>
                        </Layout.Stack>
                    {/each}
                </Accordion>
            {/each}
            <div class="u-flex u-main-space-between u-cross-center">
                <p class="text">Total results: {totalResults}</p>
                <PaginationInline limit={5} bind:offset total={totalResults} hidePages />
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
                    title="You have no users."
                    description="Create a user to see them here.">
                    <Button
                        size="s"
                        slot="actions"
                        secondary
                        external
                        href="https://appwrite.io/docs/products/auth/quick-start"
                        >Documentation</Button>
                </Empty>
            </Card.Base>
        {/if}
    </Layout.Stack>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Layout.Stack inline direction="row" gap="xs" alignItems="center">
                <Badge variant="secondary" content={selectedUsers.toString()} />
                <span>Users selected</span>
            </Layout.Stack>
            <Button submit disabled={!hasSelection}>Add</Button>
        </Layout.Stack>
    </svelte:fragment>
</Modal>
