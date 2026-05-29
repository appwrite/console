<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { InputText, InputEmail, Button, InputRadio } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { organization, currentPlan } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { roles, buildProjectRole } from '$lib/stores/billing';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import Roles from '$lib/components/roles/roles.svelte';
    import { Icon, Popover, Layout } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import { type Models } from '@appwrite.io/console';
    import ProjectAccessSelector from './projectAccessSelector.svelte';

    let {
        showCreate = $bindable(false),
        oncreated
    }: {
        showCreate: boolean;
        oncreated?: (team: Models.Membership) => void;
    } = $props();

    const supportsProjectRoles = $derived(isCloud && !!$currentPlan?.supportsOrganizationRoles);

    let email = $state('');
    let name = $state('');
    let error = $state<string>(null);
    let role = $state<string>(isSelfHosted ? 'owner' : 'developer');
    let accessType = $state<'all' | 'specific'>('all');
    let projectAccess = $state<Array<{ projectId: string; roleName: string }>>([]);
    $effect(() => {
        if (!showCreate) {
            error = null;
            email = '';
            name = '';
            role = isSelfHosted ? 'owner' : 'developer';
            accessType = 'all';
            projectAccess = [];
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

    async function create() {
        const memberRoles = buildRoles();
        if (isCloud && accessType === 'specific' && memberRoles.length === 0) {
            error = 'Add at least one project to grant access.';
            return;
        }
        try {
            const team = await sdk.forConsole.teams.createMembership({
                teamId: $organization.$id,
                roles: memberRoles,
                email,
                url: `${page.url.origin}${base}/invite`,
                name: name || undefined
            });
            await Promise.all([
                invalidate(Dependencies.ACCOUNT),
                invalidate(Dependencies.ORGANIZATION),
                invalidate(Dependencies.MEMBERS)
            ]);

            showCreate = false;
            addNotification({
                type: 'success',
                message: `Invite has been sent to ${email}`
            });
            trackEvent(Submit.MemberCreate);
            oncreated?.(team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    }
</script>

<Modal title="Invite member" {error} bind:show={showCreate} onSubmit={create}>
    <InputEmail
        required
        id="email"
        label="Email"
        placeholder="Enter email"
        autofocus
        bind:value={email} />
    <InputText id="member-name" label="Name" placeholder="Enter name" bind:value={name} />

    {#if isCloud}
        {#if supportsProjectRoles}
            <Layout.Stack direction="row" gap="s">
                <InputRadio
                    id="access-all"
                    name="invite-access-type"
                    label="All projects"
                    value="all"
                    bind:group={accessType} />
                <InputRadio
                    id="access-specific"
                    name="invite-access-type"
                    label="Specific projects"
                    value="specific"
                    bind:group={accessType} />
            </Layout.Stack>
        {/if}

        {#if accessType === 'all' || !supportsProjectRoles}
            <InputSelect required id="role" label="Role" options={roles} bind:value={role}>
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
            <ProjectAccessSelector bind:projectAccess />
        {/if}
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button submit submissionLoader>Send invite</Button>
    </svelte:fragment>
</Modal>
