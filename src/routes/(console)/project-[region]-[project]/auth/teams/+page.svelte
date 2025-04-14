<script lang="ts" context="module">
    export let showCreateTeam = writable(false);
</script>

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
    import {
        Empty,
        EmptySearch,
        AvatarInitials,
        SearchQuery,
        PaginationWithLimit
    } from '$lib/components';
    import Create from '../createTeam.svelte';
    import { goto } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container, ContainerHeader } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import { tooltip } from '$lib/actions/tooltip';
    import { writable } from 'svelte/store';
    import { readOnly } from '$lib/stores/billing';
    import { isCloud } from '$lib/system';
    import { canWriteTeams } from '$lib/stores/roles';

    export let data: PageData;

    const project = $page.params.project;
    const region = $page.params.region;
    const teamCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(`${base}/project-${region}-${project}/auth/teams/team-${event.detail.$id}`);
    };
</script>

<Container>
    <ContainerHeader
        title="Teams"
        isFlex={false}
        total={data.teams.total}
        buttonDisabled={isCloud && $readOnly}
        let:isButtonDisabled>
        <SearchQuery search={data.search} placeholder="Search by name">
            {#if $canWriteTeams}
                <div
                    use:tooltip={{
                        content: `Upgrade to add more teams`,
                        disabled: !isButtonDisabled
                    }}>
                    <Button
                        on:click={() => ($showCreateTeam = true)}
                        event="create_team"
                        disabled={isButtonDisabled}>
                        <span class="icon-plus" aria-hidden="true" />
                        <span class="text">Create team</span>
                    </Button>
                </div>
            {/if}
        </SearchQuery>
    </ContainerHeader>

    {#if data.teams.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead onlyDesktop>Members</TableCellHead>
                <TableCellHead onlyDesktop>Created</TableCellHead>
            </TableHeader>
            <TableBody service="teams" total={data.teams.total}>
                {#each data.teams.teams as team}
                    <TableRowLink
                        href={`${base}/project-${region}-${project}/auth/teams/team-${team.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <AvatarInitials size={32} name={team.name} />
                                <span class="text u-trim">{team.name}</span>
                            </div>
                        </TableCell>
                        <TableCellText onlyDesktop title="Members"
                            >{team.total} members</TableCellText>
                        <TableCellText onlyDesktop title="Created">
                            {toLocaleDateTime(team.$createdAt)}
                        </TableCellText>
                    </TableRowLink>
                {/each}
            </TableBody>
        </Table>

        <PaginationWithLimit
            name="Teams"
            limit={data.limit}
            offset={data.offset}
            total={data.teams.total} />
    {:else if data.search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn't find ‘{data.search}'</b>
                <p>There are no teams that match your search.</p>
            </div>
            <Button
                secondary
                href={`${base}/project-${$page.params.region}-${$page.params.project}/auth/teams`}>
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
