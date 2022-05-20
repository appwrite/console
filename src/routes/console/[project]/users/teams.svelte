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
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination } from '$lib/components';
    import Create from './_createTeam.svelte';
    import { goto } from '$app/navigation';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { teamsList } from './store';
    import { onMount } from 'svelte';
    import type { Models } from 'src/sdk';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/${project}/users/team/${event.detail.$id}`);
    };
    $: teamsList.load(search, limit, offset);
    $: if (search) offset = 0;
    $: {
        //TODO: refactor this into something maintainable without the use of goto
        if (offset !== null) {
            $page.url.searchParams.set('offset', offset.toString());
            goto(`?${$page.url.searchParams.toString()}`);
        }
    }

    onMount(() => {
        offset = +$page.url.searchParams.get('offset') ?? 0;
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <div class="input-text-wrapper u-stretch" style="max-width: 500px">
            <input type="search" class="input-text" bind:value={search} />
            <span class="icon-search" aria-hidden="true" />
        </div>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create Team</span>
        </Button>
    </div>
    {#if $teamsList?.response?.total}
        <Table>
            <TableHeader>
                <TableCellHead width={30} />
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Members</TableCellHead>
                <TableCellHead>Created</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $teamsList.response.teams as team}
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
                            href={`${base}/console/${project}/users/teams/${team.$id}`}>
                            {team.name}
                        </TableCellLink>
                        <TableCellText title="Members">{team.total}</TableCellText>
                        <TableCellText title="Members">
                            {toLocaleDateTime(team.dateCreated)}
                        </TableCellText>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$teamsList.response.total}</p>
            <Pagination {limit} bind:offset sum={$teamsList.response.total} />
        </div>
    {:else if search}
        <Empty>
            <svelte:fragment slot="header">No results found for <b>{search}</b></svelte:fragment>
        </Empty>
    {:else}
        <Empty>
            <svelte:fragment slot="header">No Teams Found</svelte:fragment>
            Create your first team to get started.
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
