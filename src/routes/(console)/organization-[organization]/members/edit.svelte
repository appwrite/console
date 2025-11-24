<script lang="ts">
    import { Modal } from '$lib/components';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { createEventDispatcher } from 'svelte';
    import { organization } from '$lib/stores/organization';
    import { invalidate } from '$app/navigation';
    import { BillingPlan, Dependencies } from '$lib/constants';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { Query, type Models } from '@appwrite.io/console';
    import Roles from '$lib/components/roles/roles.svelte';
    import { IconInfo, IconPlus, IconX } from '@appwrite.io/pink-icons-svelte';
    import { Icon, Layout, Popover, Table } from '@appwrite.io/pink-svelte';
    import { projectRoles, roles } from '$lib/stores/billing';
    import ChooseProject from './project.svelte';
    import { isSelfHosted } from '$lib/system';

    let {
        showEdit = $bindable(),
        selectedMember
    }: { showEdit: boolean; selectedMember: Models.Membership } = $props();

    const dispatch = createEventDispatcher();
    const defaultTeamRole = isSelfHosted ? 'owner' : 'developer';

    let error: string = $state(null);
    let showChooseProjects = $state(false);

    let isProjectSpecificRoles = $derived(
        selectedMember?.roles?.some((r) => r.startsWith('project:'))
    );
    let teamRole = $derived(isProjectSpecificRoles ? defaultTeamRole : selectedMember?.roles?.[0]);
    let isRestrictingToSpecificProjects = $derived(isProjectSpecificRoles);
    let selectedProjectsWithRole: { project: Models.Project; role: string }[] = $state([]);

    function removeProject(projectId: string) {
        selectedProjectsWithRole = selectedProjectsWithRole.filter(
            (p) => p.project.$id !== projectId
        );
    }

    async function submit() {
        try {
            const roles = isRestrictingToSpecificProjects
                ? [
                      'member',
                      ...selectedProjectsWithRole.map(
                          (pr) => `project:${pr.project.$id}/${pr.role}`
                      )
                  ]
                : [teamRole];

            const membership = await sdk.forConsole.teams.updateMembership({
                teamId: $organization.$id,
                membershipId: selectedMember.$id,
                roles: roles
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
            dispatch('updated', membership);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.MembershipUpdate);
        }
    }

    $effect(() => {
        if (!showEdit) {
            error = null;
        }
    });

    $effect(() => {
        if (!showEdit || !isProjectSpecificRoles) {
            return;
        }

        async function loadProjects() {
            const projectIdToRole = selectedMember?.roles
                ?.filter((r) => r.startsWith('project:'))
                .reduce((acc, r) => {
                    const parts = r.split(':')[1];
                    const [projectId, role] = parts.split('/');
                    acc[projectId] = role;
                    return acc;
                }, {});
            const projectIdsQuery = Object.keys(projectIdToRole).map((id) =>
                Query.equal('$id', id)
            );
            const projectsList = await sdk.forConsole.projects.list({
                queries: [Query.equal('teamId', $organization.$id), Query.or(projectIdsQuery)]
            });
            selectedProjectsWithRole = projectsList.projects.map((p) => ({
                project: p,
                role: projectIdToRole[p.$id]
            }));
        }

        loadProjects();
    });
</script>

<Modal title="Edit role" {error} size="s" bind:show={showEdit} onSubmit={submit}>
    {#if $organization?.billingPlan === BillingPlan.SCALE}
        <InputSwitch
            id="restricting-access-to-specific-projects"
            label="Restrict access to specific projects"
            bind:value={isRestrictingToSpecificProjects}>
            <svelte:fragment slot="description">
                If enabled, you will be able to allow access specific projects.
                Otherwise, the member will have access to all projects in the organization.
            </svelte:fragment>
        </InputSwitch>
    {/if}
    {#if isRestrictingToSpecificProjects}
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
                                <Roles isProjectSpecific={true} slot="tooltip" />
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
        <InputSelect required id="role" label="Role" options={roles} bind:value={teamRole}>
            <Layout.Stack direction="row" gap="none" alignItems="center" slot="info">
                <Popover let:toggle>
                    <Button extraCompact size="s" on:click={toggle}>
                        <Icon size="s" icon={IconInfo} />
                    </Button>
                    <Roles slot="tooltip" />
                </Popover>
            </Layout.Stack>
        </InputSelect>
    {/if}

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (showEdit = false)}>Cancel</Button>
        <Button
            submit
            submissionLoader
            disabled={isRestrictingToSpecificProjects && selectedProjectsWithRole.length === 0}
            >Update</Button>
    </svelte:fragment>
</Modal>

<ChooseProject
    orgId={$organization.$id}
    bind:projectsWithRole={selectedProjectsWithRole}
    bind:show={showChooseProjects} />
