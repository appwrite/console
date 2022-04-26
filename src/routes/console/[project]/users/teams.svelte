<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
    import {
        Table,
        TableHeader,
        TableBody,
        TableRow,
        TableCellHead,
        TableCellLink,
        TableCellText,
        TableCell
    } from '$lib/elements/table';
    import { Button, InputSearch } from '$lib/elements/forms';
    import { Card, Empty, Pagination } from '$lib/components';
    import Create from './_createTeam.svelte';
    import { goto } from '$app/navigation';
    import type { Models } from 'src/sdk';
    import { toLocaleDate } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/${project}/users/team/${event.detail.$id}`);
    };
    $: request = sdkForProject.teams.list(search, limit, offset);
    $: if (search) offset = 0;
</script>

<Container>
    <h1>Teams</h1>
    <Card>
        <InputSearch bind:value={search} />
    </Card>

    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <p>{response.total} teams found</p>
            <Table>
                <TableHeader>
                    <TableCellHead width={30} />
                    <TableCellHead>Name</TableCellHead>
                    <TableCellHead>Members</TableCellHead>
                    <TableCellHead>Created</TableCellHead>
                </TableHeader>
                <TableBody>
                    {#each response.teams as team}
                        <TableRow>
                            <TableCell onlyDesktop>
                                <div class="image">
                                    <img
                                        class="avatar"
                                        width="30"
                                        height="30"
                                        src={getAvatar(team.name)}
                                        alt={team.name} />
                                </div>
                            </TableCell>
                            <TableCellLink
                                title="ID"
                                href={`${base}/console/${project}/users/teams/team/${team.$id}`}>
                                {team.name}
                            </TableCellLink>
                            <TableCellText title="Members">{team.total}</TableCellText>
                            <TableCellText title="Members"
                                >{toLocaleDate(team.dateCreated)}</TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>

            <Pagination {limit} bind:offset sum={response.total} />
        {:else if search}
            <Empty>
                <svelte:fragment slot="header"
                    >No results found for <b>{search}</b></svelte:fragment>
            </Empty>
        {:else}
            <Empty>
                <svelte:fragment slot="header">No Teams Found</svelte:fragment>
                Create your first team to get started.
            </Empty>
        {/if}
    {/await}

    <Button on:click={() => (showCreate = true)}>Create Team</Button>
</Container>

<Create bind:showCreate on:created={teamCreated} />
