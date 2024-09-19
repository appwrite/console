<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, PaginationWithLimit } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
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
    import { members, newMemberModal, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from '../deleteMember.svelte';
    import { base } from '$app/paths';
    import { isOwner } from '$lib/stores/roles';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
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
            buttonText={ $isOwner ? "Invite" : ""}
            buttonMethod={() => newMemberModal.set(true)}
            showAlert={false} />

        <TableScroll>
            <TableHeader>
                <TableCellHead width={160}>Name</TableCellHead>
                <TableCellHead width={120}>Email</TableCellHead>
                <TableCellHead width={120}>Role</TableCellHead>
                <TableCellHead width={90}>2FA</TableCellHead>
                {#if $isOwner}
                <TableCellHead width={60} />
                <TableCellHead width={30} />
                {/if}
            </TableHeader>
            <TableBody
                service="members"
                total={data.organizationMembers.total}
                event="members_list">
                {#each data.organizationMembers.memberships as member}
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
                        <TableCell>
                            {#if member.invited && !member.joined}
                                <Button
                                    secondary
                                    event="invite_resend"
                                    on:click={() => resend(member)}>Resend</Button>
                            {/if}
                        </TableCell>
                        <TableCell right>
                            <button
                                class="button is-only-icon is-text"
                                aria-label="Delete item"
                                disabled={$members.total === 1}
                                on:click={() => {
                                    selectedMember = member;
                                    showDelete = true;
                                }}>
                                <span class="icon-trash" aria-hidden="true" />
                            </button>
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
