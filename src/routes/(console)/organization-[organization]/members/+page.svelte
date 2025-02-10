<script lang="ts">
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { AvatarInitials, DropList, DropListItem, PaginationWithLimit } from '$lib/components';
    import { Button as ConsoleButton } from '$lib/elements/forms';
    import { Container } from '$lib/layout';
    import { addNotification } from '$lib/stores/notifications';
    import { newMemberModal, organization } from '$lib/stores/organization';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import type { PageData } from './$types';
    import Delete from '../deleteMember.svelte';
    import { base } from '$app/paths';
    import { isOwner } from '$lib/stores/roles';
    import Edit from './edit.svelte';
    import { getRoleLabel } from '$lib/stores/billing';
    import { Drop } from '$lib/components';
    import { IconDotsHorizontal, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Table, Badge, Button, Icon } from '@appwrite.io/pink-svelte';
    import Upgrade from '$lib/components/roles/upgrade.svelte';

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
    <Layout.Stack direction="row" alignItems="center" justifyContent="flex-end">
        <ConsoleButton on:mousedown={() => newMemberModal.set(true)} event="create_user" size="s">
            <Icon size="s" icon={IconPlus} slot="start" />
            <span class="text">Invite</span>
        </ConsoleButton>
    </Layout.Stack>

    <Table.Root>
        <svelte:fragment slot="header">
            <Table.Header.Cell>Name</Table.Header.Cell>
            <Table.Header.Cell>Email</Table.Header.Cell>
            <Table.Header.Cell
                >Roles
                <Drop isPopover bind:show={showPopover} display="inline-block">
                    &nbsp;<button
                        type="button"
                        on:click={() => (showPopover = !showPopover)}
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
            </Table.Header.Cell>
            <Table.Header.Cell>2FA</Table.Header.Cell>
            {#if $isOwner}
                <Table.Header.Cell width="40px" />
            {/if}
        </svelte:fragment>
        {#each data.organizationMembers.memberships as member, index}
            <Table.Row>
                <Table.Cell width="40%">
                    <Layout.Stack direction="row" alignItems="center" gap="s">
                        <AvatarInitials size="xs" name={member.userName} />
                        <span class="u-trim">
                            {member.userName ? member.userName : 'n/a'}
                        </span>
                        {#if member.invited && !member.joined}
                            <Badge type="warning" variant="secondary" content="Pending" />
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell width="30%">
                    {member.userEmail}
                </Table.Cell>
                <Table.Cell width="20%">
                    {member.roles.map((role) => getRoleLabel(role)).join(', ')}
                </Table.Cell>
                <Table.Cell width="10%">
                    <Badge
                        size="xs"
                        type={member.mfa ? 'success' : undefined}
                        variant="secondary"
                        content={member.mfa ? 'Enabled' : 'Disabled'} />
                </Table.Cell>
                {#if $isOwner}
                    <Table.Cell>
                        <DropList bind:show={showDropdown[index]} placement="bottom-end" noArrow>
                            <Button.Button
                                icon
                                variant="text"
                                size="s"
                                aria-label="More options"
                                on:click={(e) => {
                                    e.preventDefault();
                                    showDropdown[index] = !showDropdown[index];
                                }}>
                                <Icon icon={IconDotsHorizontal} size="m" />
                            </Button.Button>
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
                    </Table.Cell>
                {/if}
            </Table.Row>
        {/each}
    </Table.Root>

    <PaginationWithLimit
        name="Members"
        limit={data.limit}
        offset={data.offset}
        total={data.members.total} />
</Container>

<Delete {selectedMember} bind:showDelete />
<Edit {selectedMember} bind:showEdit />
