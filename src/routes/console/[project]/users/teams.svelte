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
        TableCellText
    } from '$lib/elements/table';
    import { Button } from '$lib/elements/forms';
    import { Empty, Pagination, Avatar } from '$lib/components';
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
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 40, 40).toString();
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/${project}/users/teams/${event.detail.$id}`);
    };
    $: teamsList.load(search, limit, offset);
    $: if (search) offset = 0;
    $: {
        //TODO: refactor this into something maintainable without the use of goto
        if (offset !== null) {
            $page.url.searchParams.set('offset', offset.toString());
            goto(`?${$page.url.searchParams.toString()}`, { replaceState: true, keepfocus: true });
        }
    }

    onMount(() => {
        offset = +$page.url.searchParams.get('offset') ?? 0;
    });
</script>

<Container>
    <div class="u-flex u-gap-12 common-section u-main-space-between">
        <div class="input-text-wrapper u-stretch">
            <input
                type="search"
                placeholder="Search by Name"
                class="input-text"
                bind:value={search} />
            <span class="icon-search" aria-hidden="true" />
        </div>

        <Button on:click={() => (showCreate = true)}>
            <span class="icon-plus" aria-hidden="true" /> <span class="text">Create Team</span>
        </Button>
    </div>
    {#if $teamsList?.response?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Members</TableCellHead>
                <TableCellHead>Created</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $teamsList.response.teams as team}
                    <TableRow>
                        <TableCellLink
                            title="ID"
                            href={`${base}/console/${project}/users/teams/${team.$id}`}>
                            <div class="u-flex u-gap-12">
                                <Avatar size={40} name={team.name} src={getAvatar(team.name)} />
                                <span>{team.name}</span>
                            </div>
                        </TableCellLink>
                        <TableCellText title="Members">{team.total} members</TableCellText>
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
            <div class="common-section ">
                <b>Sorry, we couldn’t find ‘{search}’</b>
            </div>
            <div class="common-section">
                <p>There are no teams that match your search.</p>
            </div>
            <div class="common-section">
                <Button secondary on:click={() => (search = '')}>Clear Search</Button>
            </div>
        </Empty>
        <div class="u-flex common-section u-main-space-between">
            <p class="text">Total results: {$teamsList.response.total}</p>
            <Pagination {limit} bind:offset sum={$teamsList.response.total} />
        </div>
    {:else}
        <Empty dashed centered>
            <div class="common-section">
                <Button secondary round on:click={() => (showCreate = true)}>
                    <i class="icon-plus" />
                </Button>
            </div>
            <div class="common-section">
                <p>Add Your First Team To Get Started</p>
            </div>
            <div class="common-section">
                <Button secondary href="#">Documentation</Button>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
