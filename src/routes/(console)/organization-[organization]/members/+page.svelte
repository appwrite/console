<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import {
        AvatarInitials,
        Drop,
        DropList,
        DropListItem,
        PaginationWithLimit
    } from '$lib/components';
    import Upgrade from '$lib/components/roles/upgrade.svelte';
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
    import { getRoleLabel } from '$lib/stores/billing';
    import { addNotification } from '$lib/stores/notifications';
    import { newMemberModal, organization } from '$lib/stores/organization';
    import { isOwner } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import Delete from '../deleteMember.svelte';
    import type { PageData } from './$types';
    import Edit from './edit.svelte';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
    let showEdit = false;
    let showDropdown = [];
    let showPopover = false;

    const resend = async (member: Models.Membership) => {
        try {
            await sdk.forConsole.teams.createMembership(
                $organization.$id,
                member.roles,
                member.userEmail,
                undefined,
                undefined,
                `${$page.url.origin}${base}/invite`,
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
                <div style:--p-col-width={120} class="table-thead-col" role="columnheader">
                    <span class="u-flex u-cross-baseline">
                        <span class="eyebrow-heading-3"> Role </span>
                        <Drop isPopover bind:show={showPopover} display="inline-block">
                            &nbsp;<button
                                type="button"
                                on:click={() => (showPopover = !showPopover)}
                                class="tooltip"
                                aria-label="input tooltip">
                                <span
                                    class="icon-info"
                                    aria-hidden="true"
                                    style="font-size: var(--icon-size-small)" />
                            </button>
                            <svelte:fragment slot="list">
                                <div
                                    class="dropped card u-max-width-300 u-break-word"
                                    style:--card-border-radius="var(--border-radius-small)"
                                    style:--p-card-padding=".75rem"
                                    style:box-shadow="var(--shadow-large)">
                                    <svelte:component this={Upgrade} />
                                </div>
                            </svelte:fragment>
                        </Drop>
                    </span>
                </div>

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
                                <AvatarInitials
                                    size={40}
                                    name={member.userName || member.userEmail} />
                                <span class="text u-trim">
                                    {member.userName || 'n/a'}
                                </span>
                                {#if member.invited && !member.joined}
                                    <Pill warning>Pending</Pill>
                                {/if}
                            </div>
                        </TableCell>
                        <TableCellText title="Email">{member.userEmail}</TableCellText>
                        <TableCellText title="Role"
                            >{member.roles
                                .map((role) => getRoleLabel(role))
                                .join(', ')}</TableCellText>
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
                            <TableCell showOverflow right>
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
                                            Edit role
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
