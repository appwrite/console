<script lang="ts">
    import { page } from '$app/stores';
    import { Pagination, Empty } from '$lib/components';
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
    import { Container } from '$lib/layout';
    import { base } from '$app/paths';
    import { sdkForProject } from '$lib/stores/sdk';
    import DeleteMembership from './_deleteMembership.svelte';
    import DeleteAllMemberships from './_deleteAllMemberships.svelte';
    import type { Models } from 'src/sdk';

    const getAvatar = (name: string) => sdkForProject.avatars.getInitials(name, 30, 30).toString();
    const deleted = () => (request = sdkForProject.users.getMemberships($page.params.user));
    const project = $page.params.project;

    let offset = 0;
    let selectedMembership: Models.Membership;
    let showDelete = false;
    let showDeleteAll = false;

    const limit = 25;

    $: request = sdkForProject.users.getMemberships($page.params.user);
</script>

<Container>
    {#await request}
        <div aria-busy="true" />
    {:then response}
        {#if response.total}
            <div class="u-flex u-main-end  common-section">
                <Button secondary on:click={() => (showDeleteAll = true)}>
                    <span class="text">Delete All</span>
                </Button>
            </div>
            <Table>
                <TableHeader>
                    <TableCellHead>Name</TableCellHead>
                    <TableCellHead>Role</TableCellHead>
                    <TableCellHead width={30} />
                </TableHeader>
                <TableBody>
                    {#each response.memberships as membership}
                        <TableRow>
                            <TableCellLink
                                href={`${base}/console/${project}/users/user/${membership.userId}`}
                                title="Name">
                                <div class="u-flex u-gap-12">
                                    <img
                                        class="avatar"
                                        width="40"
                                        height="40"
                                        src={getAvatar(membership.userName)}
                                        alt={membership.userName} />
                                    <span>{membership.userName ? membership.userName : 'n/a'}</span>
                                </div>
                            </TableCellLink>
                            <TableCellText title="Role">{membership.roles}</TableCellText>
                            <TableCellText title="">
                                <button
                                    class="button is-only-icon is-text"
                                    aria-label="Delete item"
                                    on:click={() => {
                                        selectedMembership = membership;
                                        showDelete = true;
                                    }}>
                                    <span class="icon-trash" aria-hidden="true" />
                                </button>
                            </TableCellText>
                        </TableRow>
                    {/each}
                </TableBody>
            </Table>
        {:else}
            <Empty centered>
                <div class="u-flex u-flex-vertical u-cross-center">
                    <div class="common-section">
                        <p>No memberships available</p>
                    </div>
                    <div class="common-section">
                        <Button
                            external
                            secondary
                            href="https://appwrite.io/docs/server/users?sdk=nodejs-default#usersGetMemberships"
                            >Documentation</Button>
                    </div>
                </div>
            </Empty>
        {/if}
        <div
            class="u-flex u-margin-block-start-32
 u-main-space-between">
            <p class="text">Total results: {response.total}</p>
            <Pagination {limit} bind:offset sum={response.total} />
        </div>
    {/await}
</Container>

<DeleteMembership {selectedMembership} bind:showDelete on:deleted={() => deleted()} />
<DeleteAllMemberships bind:showDeleteAll />
