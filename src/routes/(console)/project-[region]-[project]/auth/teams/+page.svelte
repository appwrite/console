<script lang="ts" context="module">
    export let showCreateTeam = writable(false);
</script>

<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        AvatarInitials,
        SearchQuery,
        PaginationWithLimit
    } from '$lib/components';
    import Create from '../createTeam.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import { canWriteTeams } from '$lib/stores/roles';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    export let data;

    const teamCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(getProjectRoute(`/auth/teams/team-${event.detail.$id}`));
    };
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button on:mousedown={() => ($showCreateTeam = true)} event="create_user" size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create team
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.teams.total}
        <Table.Root columns={3} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell {root}>Name</Table.Header.Cell>
                <Table.Header.Cell {root}>Members</Table.Header.Cell>
                <Table.Header.Cell {root}>Created</Table.Header.Cell>
            </svelte:fragment>
            {#each data.teams.teams as team}
                <Table.Row.Link {root} href={getProjectRoute(`/auth/teams/team-${team.$id}`)}>
                    <Table.Cell {root}>
                        <Layout.Stack direction="row" alignItems="center">
                            <AvatarInitials size="xs" name={team.name} />
                            <span class="u-trim">{team.name}</span>
                        </Layout.Stack>
                    </Table.Cell>
                    <Table.Cell {root}>
                        {team.total} members
                    </Table.Cell>
                    <Table.Cell {root}>
                        <DualTimeView time={team.$createdAt} />
                    </Table.Cell>
                </Table.Row.Link>
            {/each}
        </Table.Root>

        <PaginationWithLimit
            name="Teams"
            limit={data.limit}
            offset={data.offset}
            total={data.teams.total} />
    {:else if data.search}
        <EmptySearch target="teams" search={data.search} hidePagination={data.teams.total === 0}>
            <Button secondary size="s" href={getProjectRoute('/auth/teams')}>Clear Search</Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={$canWriteTeams}
            on:click={() => ($showCreateTeam = true)}
            href="https://appwrite.io/docs/references/cloud/client-web/teams"
            target="team" />
    {/if}
</Container>

<Create bind:showCreate={$showCreateTeam} on:created={teamCreated} />
