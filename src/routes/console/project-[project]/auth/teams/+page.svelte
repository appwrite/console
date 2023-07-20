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
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import LL from '$i18n/i18n-svelte';

    export let data: PageData;

    let showCreate = false;

    const project = $page.params.project;
    const teamCreated = async (event: CustomEvent<Models.Team<Record<string, unknown>>>) => {
        await goto(`${base}/console/project-${project}/auth/teams/team-${event.detail.$id}`);
    };
</script>

<Container>
    <SearchQuery search={data.search} placeholder="Search by name">
        <Button on:click={() => (showCreate = true)} event="create_team">
            <span class="icon-plus" aria-hidden="true" />
            <span class="text">{$LL.console.project.button.createTeam()}</span>
        </Button>
    </SearchQuery>
    {#if data.teams.total}
        <Table>
            <TableHeader>
                <TableCellHead>{$LL.console.project.table.header.name()}</TableCellHead>
                <TableCellHead onlyDesktop
                    >{$LL.console.project.table.header.members()}</TableCellHead>
                <TableCellHead onlyDesktop
                    >{$LL.console.project.table.header.created()}</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each data.teams.teams as team}
                    <TableRowLink
                        href={`${base}/console/project-${project}/auth/teams/team-${team.$id}`}>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <AvatarInitials size={32} name={team.name} />
                                <span class="text u-trim">{team.name}</span>
                            </div>
                        </TableCell>
                        <TableCellText onlyDesktop title="Members"
                            >{team.total}
                            {$LL.console.project.texts.teams.members()}</TableCellText>
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
                <b>{$LL.console.project.texts.teams.searchData.phaseOne()}{' '}‘{data.search}’</b>
                <p>{$LL.console.project.texts.teams.searchData.phaseTwo()}</p>
            </div>
            <Button secondary href={`/console/project-${$page.params.project}/auth/teams`}>
                {$LL.console.project.button.clearSearch()}
            </Button>
        </EmptySearch>
    {:else}
        <Empty
            single
            on:click={() => (showCreate = true)}
            href="https://appwrite.io/docs/client/teams"
            target="team" />
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
