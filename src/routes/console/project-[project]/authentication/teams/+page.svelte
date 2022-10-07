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
    import { Empty, EmptySearch, Pagination, Avatar, Search } from '$lib/components';
    import Create from '../_createTeam.svelte';
    import { goto } from '$app/navigation';
    import { event } from '$lib/actions/analytics';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { teamsList } from '../store';
    import { Query, type Models } from '@aw-labs/appwrite-console';
    import { pageLimit } from '$lib/stores/layout';

    let search = '';
    let showCreate = false;
    let offset = 0;

    const project = $page.params.project;
    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 32, 32).toString();
    const teamCreated = async (event: CustomEvent<Models.Team>) => {
        await goto(`${base}/console/project-${project}/authentication/teams/${event.detail.$id}`);
    };

    $: if (search) offset = 0;
    $: teamsList.load(
        [Query.limit($pageLimit), Query.offset(offset), Query.orderDesc('$createdAt')],
        search
    );
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
            <Pagination limit={$pageLimit} bind:offset sum={$teamsList.total} />
        </div>
    {:else if search}
        <EmptySearch>
            <div class="u-text-center">
                <b>Sorry, we couldn’t find ‘{search}’</b>
                <p>There are no teams that match your search.</p>
            </div>
            <Button secondary on:click={() => (search = '')}>Clear Search</Button>
        </EmptySearch>
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
                <div class="u-text-center common-section">
                    <p>Create your first Team to get started.</p>
                    <p>Need a hand? Check out our documentation.</p>
                </div>
                <div class="u-flex u-gap-16 common-section u-main-center">
                    <Button external href="#/" text>Documentation</Button>
                    <Button secondary>Create team</Button>
                </div>
            </div>
        </Empty>
    {/if}
</Container>

<Create bind:showCreate on:created={teamCreated} />
