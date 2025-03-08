<script lang="ts">
    import { page } from '$app/stores';
    import { Empty, EmptySearch, AvatarInitials, PaginationWithLimit } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { invalidate } from '$app/navigation';
    import { base } from '$app/paths';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import type { PageData } from './$types';
    import CreateMember from '../createMembership.svelte';
    import DeleteMembership from '../deleteMembership.svelte';
    import { Dependencies } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Table, Layout, Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let data: PageData;

    let showCreate = false;
    let showDelete = false;
    let selectedMembership: Models.Membership;

    const project = $page.params.project;

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
        <Table.Root>
            <svelte:fragment slot="header">
                <Table.Header.Cell>Name</Table.Header.Cell>
                <Table.Header.Cell>Roles</Table.Header.Cell>
                <Table.Header.Cell>Joined</Table.Header.Cell>
                <Table.Header.Cell width="40px" />
            </svelte:fragment>
            {#each data.memberships.memberships as membership}
                {@const username = membership.userName ? membership.userName : '-'}
                <Table.Link href={`${base}/project-${project}/auth/user-${membership.userId}`}>
                    <Table.Cell>
                        <Layout.Stack direction="row" alignItems="center">
                            <AvatarInitials size="xs" name={username} />
                            <span>{username}</span>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell>
                        {membership.roles}
                    </Table.Cell>
                    <Table.Cell>
                        {toLocaleDateTime(membership.joined)}
                    </Table.Cell>
                    <Table.Cell>
                        <button
                            class="button is-only-icon is-text"
                            aria-label="Delete item"
                            on:click|preventDefault={() => {
                                selectedMembership = membership;
                                showDelete = true;
                                trackEvent(Click.MembershipDeleteClick);
                            }}>
                            <span class="icon-trash" aria-hidden="true" />
                        </button>
                    </Table.Cell>
                </Table.Link>
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

<CreateMember teamId={$page.params.team} bind:showCreate on:created={memberCreated} />
<DeleteMembership
    {selectedMembership}
    bind:showDelete
    on:deleted={() => invalidate(Dependencies.MEMBERSHIPS)} />
