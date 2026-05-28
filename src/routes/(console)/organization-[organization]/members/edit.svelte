<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputRadio } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { organization, currentPlan } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { type Models } from '@appwrite.io/console';
    import Roles from '$lib/components/roles/roles.svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Popover } from '@appwrite.io/pink-svelte';
    import {
        roles,
        isProjectSpecificRole,
        parseProjectRole,
        buildProjectRole
    } from '$lib/stores/billing';
    import { isCloud, isSelfHosted } from '$lib/system';
    import ProjectAccessSelector from '../projectAccessSelector.svelte';

    let {
        showEdit = $bindable(false),
        selectedMember,
        projects = [],
        onupdated
    }: {
        showEdit: boolean;
        selectedMember: Models.Membership;
        projects?: Models.Project[];
        onupdated?: (membership: Models.Membership) => void;
    } = $props();

    const supportsProjectRoles = $derived(isCloud && !!$currentPlan?.supportsOrganizationRoles);
    const defaultRole = isSelfHosted ? 'owner' : 'developer';

    let error = $state<string>(null);
    let accessType = $state<'all' | 'specific'>('all');
    let role = $state<string>(defaultRole);
    let projectAccess = $state<Array<{ projectId: string; roleName: string }>>([]);

    $effect(() => {
        if (showEdit && selectedMember) {
            const memberRoles = selectedMember.roles ?? [];
            if (memberRoles.some(isProjectSpecificRole)) {
                accessType = 'specific';
                projectAccess = memberRoles.filter(isProjectSpecificRole).map((r) => {
                    const parsed = parseProjectRole(r);
                    return {
                        projectId: parsed?.projectId ?? '',
                        roleName: parsed?.roleName ?? defaultRole
                    };
                });
                role = defaultRole;
            } else {
                accessType = 'all';
                role = memberRoles[0] ?? defaultRole;
                projectAccess = [];
            }
        }
    });

    $effect(() => {
        if (!showEdit) {
            error = null;
        }
    });

    function buildRoles(): string[] {
        if (isCloud && accessType === 'specific') {
            return projectAccess
                .filter((a) => a.projectId && a.roleName)
                .map((a) => buildProjectRole(a.projectId, a.roleName));
        }
        return [role];
    }

    async function submit() {
        const memberRoles = buildRoles();
        if (isCloud && accessType === 'specific' && memberRoles.length === 0) {
            error = 'Add at least one project to grant access.';
            return;
        }
        try {
            const membership = await sdk.forConsole.teams.updateMembership({
                teamId: $organization.$id,
                membershipId: selectedMember.$id,
                roles: memberRoles
            });
            await invalidate(Dependencies.ACCOUNT);
            await invalidate(Dependencies.ORGANIZATION);
            await invalidate(Dependencies.MEMBERS);

            showEdit = false;
            addNotification({
                type: 'success',
                message: `Role has been updated`
            });
            trackEvent(Submit.MembershipUpdate);
            onupdated?.(membership);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MembershipUpdate);
        }
    }
</script>

<Modal title="Edit role" {error} size="s" bind:show={showEdit} onSubmit={submit}>
    <Layout.Stack gap="s">
        {#if supportsProjectRoles}
            <Layout.Stack direction="row" gap="s">
                <InputRadio
                    id="edit-access-all"
                    name="edit-access-type"
                    label="All projects"
                    value="all"
                    bind:group={accessType} />
                <InputRadio
                    id="edit-access-specific"
                    name="edit-access-type"
                    label="Specific projects"
                    value="specific"
                    bind:group={accessType} />
            </Layout.Stack>
        {/if}

        {#if accessType === 'all' || !supportsProjectRoles}
            <InputSelect id="role" label="Role" required options={roles} bind:value={role}>
                <Layout.Stack direction="row" gap="none" alignItems="center" slot="info">
                    <Popover let:toggle>
                        <Button extraCompact size="s" on:click={toggle}>
                            <Icon size="s" icon={IconInfo} />
                        </Button>
                        <svelte:component this={Roles} slot="tooltip" />
                    </Popover>
                </Layout.Stack>
            </InputSelect>
        {:else}
            <ProjectAccessSelector bind:projectAccess {projects} />
        {/if}
    </Layout.Stack>

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
        <Button submit submissionLoader>Update</Button>
    </svelte:fragment>
</Modal>
