<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, Heading, PaginationWithLimit } from '$lib/components';
    import { Dependencies } from '$lib/constants';
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
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { members, newMemberModal, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from '../deleteMember.svelte';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
    const url = `${$page.url.origin}/console/`;
    const deleted = () => invalidate(Dependencies.ACCOUNT);
    const resend = async (member: Models.Membership) => {
        try {
            await sdk.forConsole.teams.createMembership(
                $organization.$id,
                member.roles,
                url,
                member.userEmail,
                undefined,
                undefined,
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
        <div class="u-flex u-gap-12 common-section u-main-space-between">
            <Heading tag="h2" size="5">Members</Heading>

            <Button on:click={() => newMemberModal.set(true)} event="invite">
                <span class="icon-plus" aria-hidden="true" />
                <span class="text">Invite</span>
            </Button>
        </div>

        <TableScroll>
            <TableHeader>
                <TableCellHead width={140}>Name</TableCellHead>
                <TableCellHead width={120}>Email</TableCellHead>
                <TableCellHead width={90} />
                <TableCellHead width={30} />
            </TableHeader>
            <TableBody>
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
                        <TableCell>
                            {#if member.invited && !member.joined}
                                <Button
                                    secondary
                                    event="invite_resend"
                                    on:click={() => resend(member)}>Resend</Button>
                            {/if}
                        </TableCell>
                        <TableCell>
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

<Delete {selectedMember} bind:showDelete on:deleted={() => deleted()} />
