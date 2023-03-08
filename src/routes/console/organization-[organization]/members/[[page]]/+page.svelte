<script lang="ts">
    import {
        TableHeader,
        TableBody,
        TableCellHead,
        TableCell,
        TableCellText,
        TableRow,
        TableScroll
    } from '$lib/elements/table';
    import { AvatarInitials, Heading, Pagination } from '$lib/components';
    import { Pill } from '$lib/elements';
    import { Button } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { organization, members, newMemberModal } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import { page } from '$app/stores';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies, PAGE_LIMIT } from '$lib/constants';
    import Delete from '../../deleteMember.svelte';
    import type { Models } from '@aw-labs/appwrite-console';
    import type { PageData } from './$types';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;

    const url = `${$page.url.origin}/console/`;
    const deleted = () => invalidate(Dependencies.ACCOUNT);
    const resend = async (member: Models.Membership) => {
        try {
            await sdk.forConsole.teams.createMembership(
                $organization.$id,
                member.userEmail,
                member.roles,
                url,
                member.userName
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
                <TableCellHead width={90}>Role</TableCellHead>
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
                        <TableCell title="Roles">
                            {#if member.invited && !member.joined}
                                <Button
                                    secondary
                                    event="invite_resend"
                                    on:click={() => resend(member)}>Resend</Button>
                            {:else}
                                {member.roles}
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
        <div class="u-flex u-margin-block-start-32 u-main-space-between">
            <p class="text">Total results: {data.organizationMembers.total}</p>
            <Pagination
                offset={data.offset}
                limit={PAGE_LIMIT}
                path={`/console/organization-${$page.params.organization}/members`}
                sum={data.members.total} />
        </div>
    {/if}
</Container>

<Delete {selectedMember} bind:showDelete on:deleted={() => deleted()} />
