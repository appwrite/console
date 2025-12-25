<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { Modal } from '$lib/components';
    import { InputText, InputEmail, Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { isCloud, isSelfHosted } from '$lib/system';
    import { projectRoles, roles } from '$lib/stores/billing';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import Roles from '$lib/components/roles/roles.svelte';
    import { Icon, Popover, Table } from '@appwrite.io/pink-svelte';
    import { IconInfo, IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import ChooseProject from './members/project.svelte';

    export let showCreate = false;

    const dispatch = createEventDispatcher();

    let email: string,
        name: string,
        error: string,
        role: string = isSelfHosted ? 'owner' : 'developer';

    let showChooseProjects = false;
    let isInvitingToSpecificProjects = false;
    let selectedProjectsWithRole: { project: Models.Project; role: string }[] = [];

    function removeProject(projectId: string) {
        selectedProjectsWithRole = selectedProjectsWithRole.filter(
            (p) => p.project.$id !== projectId
        );
    }

    async function create() {
        try {
            const roles = isInvitingToSpecificProjects
                ? [
                      'member',
                      ...selectedProjectsWithRole.map(
                          (pr) => `project:${pr.project.$id}/${pr.role}`
                      )
                  ]
                : [role];

            const team = await sdk.forConsole.teams.createMembership({
                teamId: $organization.$id,
                roles,
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
            dispatch('created', team);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MemberCreate);
        }
    }

    $: if (!showCreate) {
        error = null;
        email = null;
        name = null;
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
        {#if $organization?.billingPlan === BillingPlan.SCALE}
            <InputSwitch
                id="inviting-to-specific-projects"
                label="Invite to specific projects"
                bind:value={isInvitingToSpecificProjects}>
                <svelte:fragment slot="description">
                    If enabled, you will be able to select specific projects to invite the member to.
                    Otherwise, the member will be invited to all projects in the organization.
                </svelte:fragment>
            </InputSwitch>
        {/if}
        {#if isInvitingToSpecificProjects}
            {#if selectedProjectsWithRole.length > 0}
                <Table.Root
                    columns={[{ id: 'project' }, { id: 'role' }, { id: 'action', width: 40 }]}
                    let:root>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="project" {root}>Project</Table.Header.Cell>
                        <Table.Header.Cell column="role" {root}>
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                Role
                                <Popover let:toggle>
                                    <Button extraCompact size="s" on:click={toggle}>
                                        <Icon size="s" icon={IconInfo} />
                                    </Button>
                                    <svelte:component
                                        this={Roles}
                                        isProjectSpecific={true}
                                        slot="tooltip" />
                                </Popover>
                            </Layout.Stack>
                        </Table.Header.Cell>
                        <Table.Header.Cell column="action" {root} />
                    </svelte:fragment>
                    {#each selectedProjectsWithRole as selected}
                        <Table.Row.Base {root}>
                            <Table.Cell column="project" {root}>{selected.project.name}</Table.Cell>
                            <Table.Cell column="role" {root}>
                                <InputSelect
                                    required
                                    id="role"
                                    options={projectRoles}
                                    bind:value={selected.role} />
                            </Table.Cell>
                            <Table.Cell column="action" {root}>
                                <Button
                                    compact
                                    icon
                                    on:click={() => removeProject(selected.project.$id)}>
                                    <Icon icon={IconX} size="s" />
                                </Button>
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            {/if}
            <div>
                <Button compact on:click={() => (showChooseProjects = true)}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Choose projects
                </Button>
            </div>
        {:else}
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
        {/if}
    {/if}
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showCreate = false)}>Cancel</Button>
        <Button
            submit
            submissionLoader
            disabled={isInvitingToSpecificProjects && selectedProjectsWithRole.length === 0}
            >Send invite</Button>
    </svelte:fragment>
</Modal>

<ChooseProject
    orgId={$organization.$id}
    bind:projectsWithRole={selectedProjectsWithRole}
    bind:show={showChooseProjects} />
