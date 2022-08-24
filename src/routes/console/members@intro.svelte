<script lang="ts">
    import {
        Table,
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRow
    } from '$lib/elements/table';
    import { Avatar, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import Delete from './_deleteMember.svelte';
    import { organization, memberList, newMemberModal } from './store';
    import { sdkForConsole } from '$lib/stores/sdk';
    import type { Models } from '@aw-labs/appwrite-console';
    import { pageLimit } from '$lib/stores/layout';
    import { page } from '$app/stores';

    let search = '';
    let offset: number = null;

    let selectedMember: Models.Membership;
    let showDelete = false;
    const url = `${$page.url.origin}/console/`;

    const getAvatar = (name: string) =>
        sdkForConsole.avatars.getInitials(name, 120, 120).toString();
    const deleted = () => memberList.load($organization.$id, search, $pageLimit, offset ?? 0);
    const resend = async (member: Models.Membership) =>
        await sdkForConsole.teams.createMembership(
            $organization.$id,
            member.userEmail,
            member.roles,
            url,
            member.userName
        );

    $: if (search) offset = 0;
    $: memberList.load($organization.$id, search, $pageLimit, offset ?? 0);
</script>

<Container>
    {#if $memberList?.total}
        <div class="u-flex u-gap-12 common-section u-main-space-between">
            <h2 class="heading-level-5">Members</h2>

            <Button
                on:click={() => {
                    newMemberModal.set(true);
                }}>
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Invite</span>
            </Button>
        </div>

        <Table>
            <TableHeader>
                <TableCellHead>Name</TableCellHead>
                <TableCellHead>Email</TableCellHead>
                <TableCellHead width={100}>Role</TableCellHead>
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
                {#each $memberList.memberships as member}
                    <TableRow>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <Avatar
                                    size={40}
                                    src={getAvatar(member.userName)}
                                    name={member.userName} />
                                <span class="text u-trim"
                                    >{member.userName ? member.userName : 'n/a'}</span>
                                {#if member.invited && !member.joined}
                                    <Pill warning>Pending</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Email">{member.userEmail}</TableCellText>
                        <TableCell title="Roles">
                            {#if member.invited && !member.joined}
                                <Button secondary on:click={() => resend(member)}>Resend</Button>
                            {:else}
                                {member.roles}
                            {/if}
                        </TableCell>

                        <TableCell>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                disabled={$memberList.total === 1}
                                on:click={() => {
                                    selectedMember = member;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {$memberList.total}</p>
            <Pagination limit={$pageLimit} bind:offset sum={$memberList.total} />
        </div>
    {/if}
</Container>

{#if selectedMember}
    <Delete {selectedMember} bind:showDelete on:deleted={() => deleted()} />
{/if}
