<script lang="ts" context="module">
    export let showCreateTeam = writable(false);
</script>

<script lang="ts">
    import { page } from '$app/state';
    import { Button } from '$lib/elements/forms';
    import {
        Empty,
        EmptySearch,
        AvatarInitials,
        SearchQuery,
        PaginationWithLimit
    } from '$lib/components';
    import { clearSearchInput } from '$lib/helpers/clearSearch';
    import Create from '../createTeam.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import { canWriteTeams } from '$lib/stores/roles';
    import {
        Icon,
        Layout,
        Table,
        FloatingActionBar,
        Badge,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import Confirm from '$lib/components/confirm.svelte';

    export let data;

    const region = page.params.region;
    const project = page.params.project;
    let searchQuery;
    const clearSearch = () => clearSearchInput(searchQuery);

    let selectedTeams: string[] = [];
    let showDelete = false;
    let deleting = false;

    const columns = writable([
        { id: 'name', title: 'Name', type: 'string', width: { min: 200, max: 300 } },
        { id: 'members', title: 'Members', type: 'string', width: { min: 120, max: 150 } },
        { id: 'created', title: 'Created', type: 'string', width: { min: 120, max: 180 } }
    ]);

    const teamCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(`${base}/project-${region}-${project}/auth/teams/team-${event.detail.$id}`);
    };

    async function handleDelete() {
        showDelete = false;
        deleting = true;

        const promises = selectedTeams.map((teamId) =>
            sdk.forProject(page.params.region, page.params.project).teams.delete(teamId)
        );

        try {
            await Promise.all(promises);
            trackEvent(Submit.TeamDelete, {
                total: selectedTeams.length
            });
            addNotification({
                type: 'success',
                message: `${selectedTeams.length} team${selectedTeams.length > 1 ? 's' : ''} deleted`
            });
            invalidate(Dependencies.TEAMS);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.TeamDelete);
        } finally {
            selectedTeams = [];
            showDelete = false;
            deleting = false;
        }
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery bind:this={searchQuery} placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button on:mousedown={() => ($showCreateTeam = true)} event="create_user" size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create team
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if data.teams.total}
        <Table.Root
            columns={$columns}
            allowSelection={$canWriteTeams}
            bind:selectedRows={selectedTeams}
            let:root>
            <svelte:fragment slot="header" let:root>
                {#each $columns as { id, title }}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            </svelte:fragment>
            {#each data.teams.teams as team (team.$id)}
                <Table.Row.Link
                    {root}
                    href={`${base}/project-${region}-${project}/auth/teams/team-${team.$id}`}
                    id={team.$id}>
                    {#each $columns as column}
                        <Table.Cell column={column.id} {root}>
                            {#if column.id === 'name'}
                                <Layout.Stack direction="row" alignItems="center">
                                    <AvatarInitials size="xs" name={team.name} />
                                    <span class="u-trim">{team.name}</span>
                                </Layout.Stack>
                            {:else if column.id === 'members'}
                                {team.total} members
                            {:else if column.id === 'created'}
                                <DualTimeView time={team.$createdAt} />
                            {/if}
                        </Table.Cell>
                    {/each}
                </Table.Row.Link>
            {/each}
        </Table.Root>

        {#if selectedTeams.length > 0}
            <FloatingActionBar>
                <svelte:fragment slot="start">
                    <Badge content={selectedTeams.length.toString()} />
                    <span>
                        {selectedTeams.length > 1 ? 'teams' : 'team'}
                        selected
                    </span>
                </svelte:fragment>
                <svelte:fragment slot="end">
                    <Button text on:click={() => (selectedTeams = [])}>Cancel</Button>
                    <Button secondary on:click={() => (showDelete = true)}>Delete</Button>
                </svelte:fragment>
            </FloatingActionBar>
        {/if}

        <PaginationWithLimit
            name="Teams"
            limit={data.limit}
            offset={data.offset}
            total={data.teams.total} />
    {:else if data.search}
        <EmptySearch target="teams" search={data.search} hidePagination={data.teams.total === 0}>
            <Button secondary size="s" on:click={clearSearch}>Clear Search</Button>
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

<Confirm title="Delete teams" bind:open={showDelete} onSubmit={handleDelete} disabled={deleting}>
    <Typography.Text>
        Are you sure you want to delete <b>{selectedTeams.length}</b>
        {selectedTeams.length > 1 ? 'teams' : 'team'}?
    </Typography.Text>
    <Typography.Text>
        This action is irreversible and will permanently remove the selected teams and all their
        memberships.
    </Typography.Text>
</Confirm>
