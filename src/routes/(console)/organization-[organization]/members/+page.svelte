<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, DropList, DropListItem, PaginationWithLimit } from '$lib/components';
    import { Pill } from '$lib/elements';
    import {
        TableBody,
        TableCell,
        TableCellHead,
        TableCellText,
        TableHeader,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { Container, ContainerHeader } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { newMemberModal, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from '../deleteMember.svelte';
    import { base } from '$app/paths';
    import { isOwner } from '$lib/stores/roles';
    import Edit from './edit.svelte';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
    let showEdit = false;
    let showDropdown = [];
    const url = `${$page.url.origin}/${base}/`;
    const resend = async (member: Models.Membership) => {
        try {
            await sdk.forConsole.teams.createMembership(
                $organization.$id,
                member.roles,
                member.userEmail,
                undefined,
                undefined,
                url,
                member.userName || undefined
            );
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${member.userEmail}`
            });
            trackEvent(Submit.MemberCreate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error
            });
            trackError(error, Submit.MemberCreate);
        }
    };
</script>

<Container>
    {#if data.organizationMembers.total}
        <ContainerHeader
            title="Members"
            total={data.organizationMembers.total}
            buttonText={$isOwner ? 'Invite' : ''}
            buttonMethod={() => newMemberModal.set(true)}
            showAlert={false} />

        <TableScroll>
            <TableHeader>
                <TableCellHead width={160}>Name</TableCellHead>
                <TableCellHead width={120}>Email</TableCellHead>
                <TableCellHead width={120}>Role</TableCellHead>
                <TableCellHead width={90}>2FA</TableCellHead>
                {#if $isOwner}
                    <TableCellHead width={30} />
                {/if}
            </TableHeader>
            <TableBody
                service="members"
                total={data.organizationMembers.total}
                event="members_list">
                {#each data.organizationMembers.memberships as member, index}
                    <TableRow>
                        <TableCell title="Name">
                            <div class="u-flex u-gap-12 u-cross-center">
                                <AvatarInitials size={40} name={member.userName} />
                                <span class="text u-trim">
                                    {member.userName ? member.userName : 'n/a'}
                                </span>
                                {#if member.invited && !member.joined}
                                    <Pill warning>Pending</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Email">{member.userEmail}</TableCellText>
                        <TableCellText title="Role">{member.roles.join(',')}</TableCellText>
                        <TableCellText title="2FA">
                            <Pill success={member.mfa}>
                                {#if member.mfa}
                                    <span
                                        class="icon-check-circle u-color-text-success"
                                        aria-hidden="true" />
                                    <p class="text">enabled</p>
                                {:else}
                                    <p class="text">disabled</p>
                                {/if}
                            </Pill>
                        </TableCellText>
                        {#if $isOwner}
                            <TableCell showOverflow>
                                <DropList
                                    bind:show={showDropdown[index]}
                                    placement="bottom-start"
                                    noArrow>
                                    <button
                                        class="button is-only-icon is-text"
                                        aria-label="More options"
                                        on:click|preventDefault={() => {
                                            showDropdown[index] = !showDropdown[index];
                                        }}>
                                        <span class="icon-dots-horizontal" aria-hidden="true" />
                                    </button>
                                    <svelte:fragment slot="list">
                                        <DropListItem
                                            icon="pencil"
                                            on:click={() => {
                                                selectedMember = member;
                                                showEdit = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Edit
                                        </DropListItem>
                                        {#if member.invited && !member.joined}
                                            <DropListItem
                                                icon="refresh"
                                                on:click={() => {
                                                    resend(member);
                                                    showDropdown[index] = false;
                                                }}>
                                                Resend
                                            </DropListItem>
                                        {/if}
                                        <DropListItem
                                            icon="trash"
                                            on:click={() => {
                                                selectedMember = member;
                                                showDelete = true;
                                                showDropdown[index] = false;
                                            }}>
                                            Remove
                                        </DropListItem>
                                    </svelte:fragment>
                                </DropList>
                            </TableCell>
                        {/if}
                    </TableRow>
                {/each}
            </TableBody>
        </TableScroll>

        <PaginationWithLimit
            name="Members"
            limit={data.limit}
            offset={data.offset}
            total={data.members.total} />
    {/if}
</Container>

<Delete {selectedMember} bind:showDelete />
<Edit {selectedMember} bind:showEdit />
