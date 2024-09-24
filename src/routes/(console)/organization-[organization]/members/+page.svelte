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
    import { getRoleLabel, upgradeURL } from '$lib/stores/billing';
    import { BillingPlan } from '$lib/constants';
    import { isCloud } from '$lib/system';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
    let showEdit = false;
    let showDropdown = [];
    let showPopover = false;
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
                <div style:--p-col-width={120} class="table-thead-col" role="columnheader">
                    <span class="u-flex u-gap-8 u-cross-center">
                        <span class="eyebrow-heading-3"> Role </span>
                        <DropList bind:show={showPopover} width="20" scrollable>
                            <button type="button" on:click={() => (showPopover = !showPopover)}>
                                <span
                                    class="icon-info"
                                    aria-hidden="true"
                                    style="font-size: var(--icon-size-small)" />
                            </button>
                            <svelte:fragment slot="list">
                                <div class="u-flex u-flex-vertical u-gap-8 u-break-word">
                                    {#if isCloud}
                                        <p>
                                            <span class="u-bold">Roles</span>
                                            {#if $organization?.billingPlan === BillingPlan.FREE}
                                                <span class="inline-tag u-normal u-x-small"
                                                    >Pro plan</span>
                                            {/if}
                                        </p>
                                        {#if $organization?.billingPlan != BillingPlan.FREE}
                                            <p>
                                                Owner, Developer <span
                                                    class="inline-tag u-normal u-x-small"
                                                    >Default</span
                                                >, Editor, Analyst, Billing.
                                            </p>
                                            <p class="">
                                                <a
                                                    class="link"
                                                    href="http://appwrite.io/docs/roles"
                                                    target="_blank"
                                                    rel="noopener noreferrer">Learn more</a> about roles.
                                            </p>
                                        {:else}
                                            <p>
                                                Owner, <span class="u-color-text-disabled"
                                                    >Developer, Editor, Analyst.</span>
                                            </p>
                                            <p class="u-flex u-main-end u-cross-center u-gap-12">
                                                <a
                                                    class="button is-text"
                                                    href="http://appwrite.io/docs/roles"
                                                    target="_blank"
                                                    rel="noopener noreferrer">Learn more</a>
                                                <a class="button is-secondary" href={$upgradeURL}
                                                    >Upgrade plan</a>
                                            </p>
                                        {/if}
                                    {:else}
                                        <p>
                                            <span class="u-bold">Roles</span>
                                            <span class="inline-tag u-normal u-x-small"
                                                >Appwrite Cloud</span>
                                        </p>
                                        <p>
                                            Upgrade to Cloud to assign new roles to members or ask
                                            us about our entriprise self hosted offering.
                                        </p>
                                        <p class="u-flex u-main-end u-cross-center u-gap-12">
                                            <a
                                                class="button is-text"
                                                href="http://appwrite.io/docs/roles"
                                                target="_blank"
                                                rel="noopener noreferrer">Learn more</a>
                                            <a
                                                class="button is-secondary"
                                                href="https://cloud.appwrite.io"
                                                >Upgrade to Cloud</a>
                                        </p>
                                    {/if}
                                </div>
                            </svelte:fragment>
                        </DropList>
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
