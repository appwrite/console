<script lang="ts">
    import { goto } from '$app/navigation';
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import type { Models } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import { Empty, EmptySearch, AvatarInitials, SearchQuery, PaginationWithLimit } from '$lib/components';
    import { Container } from '$lib/layout';

    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import CreateTeam from '../createTeam.svelte';

    export let teams: { total: number; teams: Models.Team<Record<string, unknown>>[] };
    export let limit: number;
    export let offset: number;
    export const pageNum: number = 0;
    export let search: string | null;

    const clearSearchHref = `${base}/project-${page.params.region}-${page.params.project}/auth/teams`;
    const getTeamUrl = (t: Models.Team<Record<string, unknown>>) =>
        `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${t.$id}`;

    let showCreateTeam = false;
    async function onTeamCreated(e: CustomEvent<Models.Team<Record<string, unknown>>>) {
        await goto(getTeamUrl(e.detail));
    }
</script>

<Container>
    <Layout.Stack direction="row" justifyContent="space-between">
        <Layout.Stack direction="row" alignItems="center">
            <SearchQuery placeholder="Search by name" />
        </Layout.Stack>
        <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
            <Button on:mousedown={() => (showCreateTeam = true)} event="create_user" size="s">
                <Icon icon={IconPlus} slot="start" size="s" />
                Create team
            </Button>
        </Layout.Stack>
    </Layout.Stack>

    {#if teams.total}
        <Table.Root columns={3} let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell {root}>Name</Table.Header.Cell>
                <Table.Header.Cell {root}>Members</Table.Header.Cell>
                <Table.Header.Cell {root}>Created</Table.Header.Cell>
            </svelte:fragment>
            {#each teams.teams as team}
                {@const href = getTeamUrl(team)}
                {#if href}
                <Table.Row.Link {root} href={href}>
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
                {:else}
                <Table.Row.Base {root}>
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
                </Table.Row.Base>
                {/if}
            {/each}
        </Table.Root>

        <PaginationWithLimit name="Teams" {limit} {offset} total={teams.total} />
    {:else if search}
        <EmptySearch target="teams" search={search} hidePagination={teams.total === 0}>
            <Button secondary size="s" href={clearSearchHref}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            allowCreate={true}
            on:click={() => (showCreateTeam = true)}
            href="https://appwrite.io/docs/references/cloud/client-web/teams"
            target="team" />
    {/if}
</Container>

<CreateTeam bind:showCreate={showCreateTeam} on:created={onTeamCreated} />
