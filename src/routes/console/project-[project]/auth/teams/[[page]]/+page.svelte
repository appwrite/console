<script lang="ts">
    import { page } from '$app/stores';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRowLink,
        TableCellHead,
        TableCellText,
        TableCell
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Empty, EmptySearch, AvatarInitials, Pagination, SearchQuery } from '$lib/components';
    import Create from '../../_createTeam.svelte';
    import { goto } from '$app/navigation';
    import { event } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import { PAGE_LIMIT } from '$lib/constants';

    export let data: PageData;

    let showCreate = false;

    const project = $page.params.project;
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/project-${project}/auth/teams/team-${event.detail.$id}`);
    };
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by name">
        <span
            use:event={{
                name: 'console_users',
                action: 'click_create',
                parameters: {
                    type: 'team'
                }
            }}>
            <Button on:click={() => (showCreate = true)}>
                <span class="icon-plus" aria-hidden="true" /> <span class="text">Create team</span>
            </Button>
        </span>
    </SearchQuery>
    {#if data.teams.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Members</TableCellHead>
                <TableCellHead>Created</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.teams.teams as team}
                    <TableRowLink
                        href={`${base}/console/project-${project}/auth/teams/team-${team.$id}`}>
                        <TableCell title="ID">
                            <div class="u-flex u-gap-12">
                                <AvatarInitials size={32} name={team.name} />
                                <span class="text u-trim">{team.name}</span>
                            </div>
                        </TableCell>
                        <TableCellText title="Members">{team.total} members</TableCellText>
                        <TableCellText title="Members">
                            {toLocaleDateTime(team.$createdAt)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.teams.total}</p>
            <Pagination
                limit={PAGE_LIMIT}
                path={`/console/project-${$page.params.project}/auth/teams`}
                offset={data.offset}
                sum={data.teams.total} />
        </div>
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{data.search}’</b>
                <p>There are no teams that match your search.</p>
            </div>
            <Button secondary href={`/console/project-${$page.params.project}/auth/teams`}>
                Clear Search
            </Button>
        </EmptySearch>
    {:else}
        <Empty single on:click={() => (showCreate = true)}>
            <div
                class="common-section"
                use:event={{
                    name: 'console_users',
                    action: 'click_create',
                    parameters: {
                        type: 'team'
                    }
                }}>
                <div class="u-text-center common-section">
                    <p>Create your first team to get started.</p>
                    <p>Need a hand? Check out our documentation.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="https://appwrite.io/docs/client/teams" text>
                        Documentation
                    </Button>
                    <Button secondary on:click={() => (showCreate = true)}>Create team</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
