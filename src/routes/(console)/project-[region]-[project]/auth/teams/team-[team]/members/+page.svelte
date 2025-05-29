<script lang="ts">
    import { page } from '$app/state';
    import { Empty, EmptySearch, AvatarInitials, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { invalidate } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import CreateMember from '../createMembership.svelte';
    import DeleteMembership from '../deleteMembership.svelte';
    import { Dependencies } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Table, Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let selectedMembership: Models.Membership;

    async function memberCreated() {
        invalidate(Dependencies.MEMBERSHIPS);
    }
</script>

<Container>
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <Button on:mousedown={() => (showCreate = true)} event="create_membership" size="s">
            <Icon icon={IconPlus} slot="start" size="s" />
            Create membership
        </Button>
    </Layout.Stack>

    {#if data.memberships.total}
        <Table.Root
            let:root
            columns={[
                { id: 'name' },
                { id: 'roles' },
                { id: 'joined' },
                { id: 'actions', width: 40 }
            ]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
                <Table.Header.Cell column="roles" {root}>Roles</Table.Header.Cell>
                <Table.Header.Cell column="joined" {root}>Joined</Table.Header.Cell>
                <Table.Header.Cell column="actions" {root} />
            </svelte:fragment>
            {#each data.memberships.memberships as membership}
                {@const username = membership.userName ? membership.userName : '-'}
                <Table.Row.Link {root} href={getProjectRoute(`/auth/user-${membership.userId}`)}>
                    <Table.Cell column="name" {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            <AvatarInitials size="xs" name={username} />
                            <span>{username}</span>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell column="roles" {root}>
                        {membership.roles}
                    </Table.Cell>
                    <Table.Cell column="joined" {root}>
                        {toLocaleDateTime(membership.joined)}
                    </Table.Cell>
                    <Table.Cell column="actions" {root}>
                        <button
                            class="button is-only-icon is-text"
                            aria-label="Delete item"
                            on:click|preventDefault={() => {
                                selectedMembership = membership;
                                showDelete = true;
                                trackEvent(Click.MembershipDeleteClick);
                            }}>
                            <span class="icon-trash" aria-hidden="true"></span>
                        </button>
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Memberships"
            limit={data.limit}
            offset={data.offset}
            total={data.memberships.total} />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find ‘{data.search}'</b>
                <p>There are no members that match your search.</p>
            </div>
            <Button
                external
                href="https://appwrite.io/docs/products/auth/teams#create-membership"
                text>
                Documentation
            </Button>
            <Button secondary on:click={() => (showCreate = true)}>Create membership</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            href="https://appwrite.io/docs/products/auth/teams"
            target="membership"
            on:click={() => (showCreate = true)} />
    {/if}
</Container>

<CreateMember teamId={page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership
    {selectedMembership}
    bind:showDelete
    on:deleted={() => invalidate(Dependencies.MEMBERSHIPS)} />
