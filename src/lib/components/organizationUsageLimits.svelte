<script lang="ts">
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { getBasePlanFromGroup, getServiceLimit } from '$lib/stores/billing';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Badge, Icon, Layout, Table, Typography, Tooltip } from '@appwrite.io/pink-svelte';
    import { IconArrowUp, IconInfo } from '@appwrite.io/pink-icons-svelte';

    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Modal } from '$lib/components';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { toLocaleDateTime } from '$lib/helpers/date';
    import { BillingPlanGroup, type Models } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';

    const {
        projects = [],
        members = [],
        storageUsage = 0
    }: {
        storageUsage?: number;
        projects?: Models.Project[];
        members?: Models.Membership[];
        organization: Models.Organization;
    } = $props();

    let showSelectProject = $state(false);
    let error = $state<string | null>(null);
    let showSelectionReminder = $state(false);
    let hasConfirmedSelection = $state(false);

    let isDeletingProjects = $state(false);
    let deletedProjectIds = $state<Set<string>>(new Set());
    let selectedProjectsToDelete = $state<Array<string>>([]);
    const baseFreePlan = getBasePlanFromGroup(BillingPlanGroup.Starter);

    // Derived state using runes
    const freePlanLimits = $derived({
        projects: baseFreePlan?.projects,
        members: getServiceLimit('members', null, baseFreePlan),
        storage: getServiceLimit('storage', null, baseFreePlan)
    });

    // When preparing to downgrade to Free, enforce Free plan limit locally (2)
    const allowedProjectsToKeep = $derived(freePlanLimits.projects);

    const filteredProjects = $derived(
        projects.filter((project) => !deletedProjectIds.has(project.$id))
    );

    const currentUsage = $derived({
        projects: filteredProjects?.length || 0,
        members: members?.length || 0,
        storage: storageUsage || 0
    });

    const storageUsageGB = $derived(storageUsage / (1024 * 1024 * 1024));

    const isLimitExceeded = $derived({
        projects: currentUsage.projects > freePlanLimits.projects,
        members: currentUsage.members > freePlanLimits.members,
        storage: storageUsageGB > freePlanLimits.storage
    });

    const excessUsage = $derived({
        projects: Math.max(0, currentUsage.projects),
        members: Math.max(0, currentUsage.members - freePlanLimits.members),
        storage: Math.max(0, storageUsageGB - freePlanLimits.storage)
    });

    function formatNumber(num: number): string {
        return formatNumberWithCommas(num);
    }

    function handleManageProjects() {
        showSelectProject = true;
        showSelectionReminder = false;
        trackEvent(Click.OrganizationClickUpgrade, { source: 'usage_limits_manage_projects' });
    }

    async function deleteSelected() {
        error = null;
        isDeletingProjects = true;

        const excessBy = isLimitExceeded.projects ? projects.length - allowedProjectsToKeep : 0;
        const isUnderLimitPostSelection = selectedProjectsToDelete.length >= excessBy;

        if (!isUnderLimitPostSelection) {
            error = `You can keep a maximum ${allowedProjectsToKeep} projects on the selected plan.`;
            return;
        }

        if (selectedProjectsToDelete?.length) {
            const projectsDeletionPromises = selectedProjectsToDelete.map((projectId) => ({
                projectId,
                promise: sdk.forConsole.projects.delete({ projectId })
            }));

            try {
                const results = await Promise.allSettled(
                    projectsDeletionPromises.map((p) => p.promise)
                );

                const failed: string[] = [];
                const successfullyDeleted: string[] = [];

                results.forEach((result, index) => {
                    const projectId = projectsDeletionPromises[index].projectId;
                    if (result.status === 'fulfilled') {
                        successfullyDeleted.push(projectId);
                    } else {
                        failed.push(projectId);
                    }
                });

                if (successfullyDeleted.length > 0) {
                    deletedProjectIds = new Set([...deletedProjectIds, ...successfullyDeleted]);
                    await invalidate(Dependencies.ORGANIZATION);

                    addNotification({
                        type: 'success',
                        message: `${successfullyDeleted.length} project${successfullyDeleted.length !== 1 ? 's' : ''} deleted successfully`
                    });
                }

                if (failed.length > 0) {
                    error = `Failed to delete ${failed.length} project${failed.length !== 1 ? 's' : ''}`;
                } else {
                    showSelectProject = false;
                    selectedProjectsToDelete = [];
                    hasConfirmedSelection = false;
                    showSelectionReminder = false;
                }
            } catch (exception) {
                error = exception.message;
            } finally {
                isDeletingProjects = false;
            }
        }
    }
</script>

<Layout.Stack gap="l">
    {#if showSelectionReminder}
        <Alert.Inline status="warning" title="Choose projects to keep">
            The Free plan lets you keep {allowedProjectsToKeep} projects. Select them before continuing.
            <Layout.Stack
                direction="row"
                justifyContent="flex-start"
                gap="xs"
                style="position: relative; z-index: 10; pointer-events: auto;">
                <Button compact on:click={handleManageProjects}>Manage projects</Button>
            </Layout.Stack>
        </Alert.Inline>
    {/if}

    <div class="responsive-table">
        <Table.Root
            columns={[
                { id: 'resource', width: { min: 215 } },
                { id: 'freeLimit', width: { min: 100 } },
                { id: 'excessUsage', width: { min: 120 } },
                { id: 'manage', width: { min: 110 } }
            ]}
            let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="resource" {root}>Resource</Table.Header.Cell>
                <Table.Header.Cell column="freeLimit" {root}>Free limit</Table.Header.Cell>
                <Table.Header.Cell column="excessUsage" {root}>
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Typography.Text>Excess usage</Typography.Text>
                        <Tooltip placement="bottom" portal>
                            <Icon icon={IconInfo} size="s" />
                            <span slot="tooltip">Usage beyond the Free plan limits.</span>
                        </Tooltip>
                    </Layout.Stack>
                </Table.Header.Cell>
                <Table.Header.Cell column="manage" {root}></Table.Header.Cell>
            </svelte:fragment>

            <!-- Projects Row -->
            <Table.Row.Base {root}>
                <Table.Cell column="resource" {root}>
                    <Layout.Stack direction="row" alignItems="center" gap="xs">
                        <Typography.Text>Projects</Typography.Text>
                        {#if isLimitExceeded.projects}
                            <Badge
                                size="xs"
                                content="Action required"
                                variant="secondary"
                                type="warning" />
                        {/if}
                    </Layout.Stack>
                </Table.Cell>
                <Table.Cell column="freeLimit" {root}>
                    <Typography.Text
                        >{formatNumber(allowedProjectsToKeep)} projects</Typography.Text>
                </Table.Cell>
                <Table.Cell column="excessUsage" {root}>
                    {#if isLimitExceeded.projects}
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            <Icon icon={IconArrowUp} size="s" color="--fgcolor-error" />
                            <Typography.Text color="--fgcolor-error">
                                {formatNumber(excessUsage.projects)} projects
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Typography.Text color="--fgcolor-neutral-secondary">
                            {formatNumber(currentUsage.projects)} / {formatNumber(
                                allowedProjectsToKeep
                            )}
                        </Typography.Text>
                    {/if}
                </Table.Cell>
                <Table.Cell column="manage" {root}>
                    {#if isLimitExceeded.projects}
                        <Layout.Stack direction="row" justifyContent="flex-end">
                            <Button size="xs" secondary on:click={handleManageProjects}
                                >Manage projects</Button>
                        </Layout.Stack>
                    {/if}
                </Table.Cell>
            </Table.Row.Base>

            <!-- Organization Members Row -->
            <Table.Row.Base {root}>
                <Table.Cell column="resource" {root}>
                    <Typography.Text>Organization members</Typography.Text>
                </Table.Cell>
                <Table.Cell column="freeLimit" {root}>
                    <Typography.Text>{formatNumber(freePlanLimits.members)} member</Typography.Text>
                </Table.Cell>
                <Table.Cell column="excessUsage" {root}>
                    {#if isLimitExceeded.members}
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            <Icon icon={IconArrowUp} size="s" color="--fgcolor-error" />
                            <Typography.Text color="--fgcolor-error">
                                {formatNumber(excessUsage.members)} members
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Typography.Text color="--fgcolor-neutral-secondary">N/A</Typography.Text>
                    {/if}
                </Table.Cell>
                <Table.Cell column="manage" {root}></Table.Cell>
            </Table.Row.Base>

            <!-- Storage Row -->
            <Table.Row.Base {root}>
                <Table.Cell column="resource" {root}>
                    <Typography.Text>Storage</Typography.Text>
                </Table.Cell>
                <Table.Cell column="freeLimit" {root}>
                    <Typography.Text>{freePlanLimits.storage} GB</Typography.Text>
                </Table.Cell>
                <Table.Cell column="excessUsage" {root}>
                    {#if isLimitExceeded.storage}
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            <Icon icon={IconArrowUp} size="s" color="--fgcolor-error" />
                            <Typography.Text color="--fgcolor-error">
                                {excessUsage.storage.toFixed(2)} GB
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Typography.Text color="--fgcolor-neutral-secondary">
                            {storageUsageGB.toFixed(2)} / {freePlanLimits.storage} GB
                        </Typography.Text>
                    {/if}
                </Table.Cell>
                <Table.Cell column="manage" {root}></Table.Cell>
            </Table.Row.Base>
        </Table.Root>
    </div>
</Layout.Stack>

{#if showSelectProject}
    {@const requiredToDelete = currentUsage.projects - allowedProjectsToKeep}
    <Modal
        bind:show={showSelectProject}
        title="Delete projects to downgrade"
        onSubmit={deleteSelected}
        dismissible={false}>
        <Typography.Text slot="description">
            The Free plan lets you keep {allowedProjectsToKeep} projects. Select projects you want to
            permanently delete.
        </Typography.Text>

        {#if error}
            <Alert.Inline status="error" title="Error">{error}</Alert.Inline>
        {:else}
            <Alert.Inline
                status="warning"
                title="The selected projects will be permanently deleted">
                The selected projects and all associated data will be permanently deleted and cannot
                be recovered.
            </Alert.Inline>
        {/if}

        <Layout.Stack gap="m">
            <Layout.Stack gap="s" direction="row">
                <Typography.Text
                    >Select {requiredToDelete} project{requiredToDelete !== 1 ? 's' : ''} to delete</Typography.Text>

                <Badge
                    size="xs"
                    variant="secondary"
                    content={`${selectedProjectsToDelete.length} selected`} />
            </Layout.Stack>

            <div class="controlled-selection">
                <Table.Root
                    let:root
                    allowSelection
                    bind:selectedRows={selectedProjectsToDelete}
                    columns={[{ id: 'name' }, { id: 'created' }]}>
                    <svelte:fragment slot="header" let:root>
                        <Table.Header.Cell column="name" {root}>Project Name</Table.Header.Cell>
                        <Table.Header.Cell column="created" {root}>Created</Table.Header.Cell>
                    </svelte:fragment>
                    {#each projects as project}
                        {@const isRowSelected = selectedProjectsToDelete.includes(project.$id)}
                        {@const shouldDisable =
                            !isRowSelected && selectedProjectsToDelete.length >= requiredToDelete}
                        <Table.Row.Base
                            {root}
                            id={project.$id}
                            select={shouldDisable ? 'disabled' : undefined}>
                            <Table.Cell column="name" {root}
                                ><Typography.Text truncate>{project.name}</Typography.Text
                                ></Table.Cell>
                            <Table.Cell column="created" {root}>
                                {toLocaleDateTime(project.$createdAt)}
                            </Table.Cell>
                        </Table.Row.Base>
                    {/each}
                </Table.Root>
            </div>
        </Layout.Stack>

        {#if selectedProjectsToDelete.length >= requiredToDelete}
            <InputCheckbox
                id="confirmation"
                bind:checked={hasConfirmedSelection}
                label="I understand these projects will be permanently deleted and cannot be recovered." />
        {/if}

        <svelte:fragment slot="footer">
            <Button secondary on:click={() => (showSelectProject = false)}>Cancel</Button>
            <Button
                submit
                danger
                submissionLoader
                forceShowLoader={isDeletingProjects}
                disabled={selectedProjectsToDelete.length < requiredToDelete ||
                    !hasConfirmedSelection}>Delete projects</Button>
        </svelte:fragment>
    </Modal>
{/if}

<style>
    /* Responsive table container */
    .responsive-table {
        overflow-x: auto;
        width: 100%;
        min-width: 0;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: thin;
        position: relative;
        z-index: 2;
    }

    /* Small viewport optimizations */
    @media (max-width: 640px) {
        .responsive-table {
            margin-inline: -1rem;
            padding-inline: 1rem;
            z-index: 5;
        }

        .responsive-table :global(td),
        .responsive-table :global(th) {
            padding: 0.5rem 0.25rem;
            font-size: 0.875rem;
        }

        .responsive-table :global(td:nth-child(1) .badge) {
            white-space: nowrap;
            flex-shrink: 0;
        }
        .responsive-table :global(td:nth-child(1) .layout-stack) {
            flex-wrap: nowrap;
            gap: 6px !important;
        }

        .responsive-table :global(th:nth-child(4)),
        .responsive-table :global(td:nth-child(4)) {
            width: 96px;
            min-width: 96px;
        }
    }

    .controlled-selection :global([role='rowheader']) {
        pointer-events: none;

        :global([role='cell']) {
            opacity: 0.5;
            cursor: not-allowed;
            color: var(--fgcolor-neutral-secondary);
        }
    }
</style>
