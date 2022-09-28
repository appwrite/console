<script lang="ts">
    import { page } from '$app/stores';
    import { sdkForProject } from '$lib/stores/sdk';
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
    import { Empty, Pagination, Avatar, Search } from '$lib/components';
    import Create from '../_createTeam.svelte';
    import { goto } from '$app/navigation';
    import { event } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { teamsList } from '../store';
    import type { Models } from '@aw-labs/appwrite-console';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const limit = 25;
    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/project-${project}/authentication/teams/${event.detail.$id}`);
    };

    $: if (search) offset = 0;
    $: teamsList.load(search, limit, offset);
</script>

<Container>
    <Search bind:search placeholder="Search by name">
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
    </Search>
    {#if $teamsList?.total}
        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Members</TableCellHead>
                <TableCellHead>Created</TableCellHead>
            </TableHeader>
            <TableBody>
                {#each $teamsList.teams as team}
                    <TableRowLink
                        href={`${base}/console/project-${project}/authentication/teams/${team.$id}`}>
                        <TableCell title="ID">
                            <div class="u-flex u-gap-12">
                                <Avatar size={32} name={team.name} src={getAvatar(team.name)} />
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
            <p class="text">Total results: {$teamsList.total}</p>
            <Pagination {limit} bind:offset sum={$teamsList.total} />
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
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$teamsList.total}</p>
            <Pagination {limit} bind:offset sum={$teamsList.total} />
        </div>
    {:else}
        <Empty isButton single on:click={() => (showCreate = true)}>
            <div
                class="common-section"
                use:event={{
                    name: 'console_users',
                    action: 'click_create',
                    parameters: {
                        type: 'team'
                    }
                }}>
                <p>Create your first team to get started</p>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
