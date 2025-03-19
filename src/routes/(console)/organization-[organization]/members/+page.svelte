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
    import {
        IconDotsHorizontal,
        IconInfo,
        IconPencil,
        IconPlus,
        IconRefresh,
        IconTrash
    } from '@appwrite.io/pink-icons-svelte';
    import {
        Layout,
        Table,
        Badge,
        Button,
        Icon,
        Typography,
        Popover,
        ActionMenu
    } from '@appwrite.io/pink-svelte';
    import Upgrade from '$lib/components/roles/upgrade.svelte';

    export let data: PageData;

    let selectedMember: Models.Membership;
    let showDelete = false;
    let showEdit = false;
    let showDropdown = [];

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
    <Layout.Stack direction="row" justifyContent="space-between">
        <Typography.Title>Members</Typography.Title>
        <ConsoleButton on:mousedown={() => newMemberModal.set(true)} event="create_user" size="s">
            <Icon size="s" icon={IconPlus} slot="start" />
            <span class="text">Invite</span>
        </ConsoleButton>
    </Layout.Stack>

    <Table.Root
        let:root
        columns={[
            { id: 'name' },
            { id: 'email' },
            { id: 'roles' },
            { id: 'mfa' },
            { id: 'actions', hide: !$isOwner, width: 40 }
        ]}>
        <svelte:fragment slot="header" let:root>
            <Table.Header.Cell column="name" {root}>Name</Table.Header.Cell>
            <Table.Header.Cell column="email" {root}>Email</Table.Header.Cell>
            <Table.Header.Cell column="roles" {root}>
                <Layout.Stack direction="row" gap="xxxs" alignItems="center">
                    Roles
                    <Popover let:toggle>
                        <Button.Button icon variant="extra-compact" size="s" on:click={toggle}>
                            <Icon size="s" icon={IconInfo} />
                        </Button.Button>
                        <svelte:component this={Upgrade} slot="tooltip" />
                    </Popover>
                </Layout.Stack>
            </Table.Header.Cell>
            <Table.Header.Cell column="mfa" {root}>2FA</Table.Header.Cell>
            <Table.Header.Cell column="actions" {root} />
        </svelte:fragment>
        {#each data.organizationMembers.memberships as member, index}
            <Table.Row.Base {root}>
                <Table.Cell column="name" {root}>
                    <Layout.Stack direction="row" alignItems="center" gap="s">
                        <AvatarInitials size="xs" name={member.userName} />
                        <span class="u-trim">
                            {member.userName ? member.userName : 'n/a'}
                        </span>
                        {#if member.invited && !member.joined}
                            <Badge type="warning" variant="secondary" content="Pending" size="xs" />
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell column="email" {root}>
                    {member.userEmail}
                </Table.Cell>
                <Table.Cell column="roles" {root}>
                    {member.roles.map((role) => getRoleLabel(role)).join(', ')}
                </Table.Cell>
                <Table.Cell column="mfa" {root}>
                    <Badge
                        size="xs"
                        type={member.mfa ? 'success' : undefined}
                        variant="secondary"
                        content={member.mfa ? 'Enabled' : 'Disabled'} />
                </Table.Cell>
                <Table.Cell column="actions" {root}>
                    <Popover let:toggle padding="none" placement="bottom-end">
                        <Button.Button icon variant="ghost" size="s" on:click={toggle}>
                            <Icon size="s" icon={IconDotsHorizontal} />
                        </Button.Button>
                        <div style:min-width="232px" slot="tooltip">
                            <ActionMenu.Root>
                                <ActionMenu.Item.Button
                                    trailingIcon={IconPencil}
                                    on:click={() => {
                                        selectedMember = member;
                                        showEdit = true;
                                        showDropdown[index] = false;
                                    }}>
                                    Edit role
                                </ActionMenu.Item.Button>
                                {#if member.invited && !member.joined}
                                    <ActionMenu.Item.Button
                                        trailingIcon={IconRefresh}
                                        on:click={() => {
                                            resend(member);
                                        }}>
                                        Resend
                                    </ActionMenu.Item.Button>
                                {/if}
                                <ActionMenu.Item.Button
                                    trailingIcon={IconTrash}
                                    on:click={() => {
                                        selectedMember = member;
                                        showDelete = true;
                                    }}>
                                    Remove
                                </ActionMenu.Item.Button>
                            </ActionMenu.Root>
                        </div>
                    </Popover>
                </Table.Cell>
            </Table.Row.Base>
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
