<script lang="ts" module>
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
        PaginationWithLimit,
        type DeleteOperationState,
        MultiSelectionTable
    } from '$lib/components';
    import Create from '../createTeam.svelte';
    import { goto } from '$app/navigation';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import { writable } from 'svelte/store';
    import { canWriteTeams } from '$lib/stores/roles';
    import { Icon, Layout, Table } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import DualTimeView from '$lib/components/dualTimeView.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { invalidate } from '$app/navigation';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();

    const columns = writable([
        { id: 'name', title: 'Name', type: 'string', width: { min: 200, max: 300 } },
        { id: 'members', title: 'Members', type: 'string', width: { min: 120, max: 150 } },
        { id: 'created', title: 'Created', type: 'string', width: { min: 120, max: 180 } }
    ]);

    const teamCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(
            `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${event.detail.$id}`
        );
    };

    async function handleDelete(selectedRows: string[]): Promise<DeleteOperationState> {
        const promises = selectedRows.map((teamId) => {
            return sdk.forProject(page.params.region, page.params.project).teams.delete({ teamId });
        });

        try {
            await Promise.all(promises);
            trackEvent(Submit.TeamDelete, { total: selectedRows.length });
        } catch (error) {
            trackError(error, Submit.TeamDelete);
            return error;
        } finally {
            await invalidate(Dependencies.TEAMS);
        }
    }
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
        <MultiSelectionTable
            resource="team"
            columns={$columns}
            onDelete={handleDelete}
            allowSelection={$canWriteTeams}>
            {#snippet header(root)}
                {#each $columns as { id, title }}
                    <Table.Header.Cell column={id} {root}>{title}</Table.Header.Cell>
                {/each}
            {/snippet}

            {#snippet children(root)}
                {@const TableRowComponent = $canWriteTeams ? Table.Row.Link : Table.Row.Base}
                {#each data.teams.teams as team (team.$id)}
                    {@const href = $canWriteTeams
                        ? `${base}/project-${page.params.region}-${page.params.project}/auth/teams/team-${team.$id}`
                        : undefined}
                    <TableRowComponent {root} {href} id={team.$id}>
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
                    </TableRowComponent>
                {/each}
            {/snippet}

            {#snippet deleteContentNotice()}
                This action is irreversible and will permanently remove the selected teams and all
                their memberships.
            {/snippet}
        </MultiSelectionTable>

        <PaginationWithLimit
            name="Teams"
            limit={data.limit}
            offset={data.offset}
            total={data.teams.total} />
    {:else if data.search}
        <EmptySearch target="teams" search={data.search} hidePagination={data.teams.total === 0}>
            <Button
                size="s"
                secondary
                href={`${base}/project-${page.params.region}-${page.params.project}/auth/teams`}>
                Clear Search
            </Button>
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
