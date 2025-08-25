<script lang="ts">
    import { Button } from '$lib/elements/forms';
    import { getServiceLimit } from '$lib/stores/billing';
    import { BillingPlan } from '$lib/constants';
    import { Click, trackEvent } from '$lib/actions/analytics';
    import { Badge, Icon, Layout, Table, Typography } from '@appwrite.io/pink-svelte';
    import { IconArrowUp } from '@appwrite.io/pink-icons-svelte';

    import { formatNumberWithCommas } from '$lib/helpers/numbers';
    import { Modal } from '$lib/components';
    import { organization, currentPlan } from '$lib/stores/organization';
    import { Alert } from '@appwrite.io/pink-svelte';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { billingProjectsLimitDate } from '$lib/stores/billing';
    import { page } from '$app/state';

    let showSelectProject = false;
    let selectedProjects: string[] = [];
    let error: string | null = null;
    let showSelectionReminder = false;

    // Get data from layout
    $: projects = page.data.allProjects?.projects || [];
    $: members = page.data.members?.memberships || [];
    $: storageUsage = page.data.billingAggregation?.usageStorage || 0;

    $: freePlanLimits = {
        projects: 2, // fallback
        members: getServiceLimit('members', BillingPlan.FREE),
        storage: getServiceLimit('storage', BillingPlan.FREE)
    };

    //fallback to free limit when undefined
    $: allowedProjectsToKeep =
        $currentPlan?.projects && $currentPlan.projects > 0
            ? $currentPlan.projects
            : freePlanLimits.projects;

    $: currentUsage = {
        projects: projects?.length || 0,
        members: members?.length || 0,
        storage: storageUsage || 0
    };

    $: storageUsageGB = storageUsage / (1024 * 1024 * 1024);

    $: isLimitExceeded = {
        projects: currentUsage.projects > freePlanLimits.projects,
        members: currentUsage.members > freePlanLimits.members,
        storage: storageUsageGB > freePlanLimits.storage
    };

    $: excessUsage = {
        projects: Math.max(0, currentUsage.projects),
        members: Math.max(0, currentUsage.members - freePlanLimits.members),
        storage: Math.max(0, storageUsageGB - freePlanLimits.storage)
    };

    // projects that would be archived with the current selection
    $: projectsToArchive = projects.filter((project) => !selectedProjects.includes(project.$id));

    function formatProjectsToArchive(): string {
        let result = '';
        projectsToArchive.forEach((project, index) => {
            const isLast = index === projectsToArchive.length - 1;
            const isSecondLast = index === projectsToArchive.length - 2;

            result += `${index === 0 ? '' : ' '}${project.name}`;

            if (!isLast) {
                if (isSecondLast) result += ' and';
                else result += ',';
            }
        });
        return result;
    }

    function formatNumber(num: number): string {
        return formatNumberWithCommas(num);
    }

    function handleManageProjects() {
        showSelectProject = true;
        trackEvent(Click.OrganizationClickUpgrade, { source: 'usage_limits_manage_projects' });
    }

    // Expose validation for parent to call before submitting downgrade
    export function validateOrAlert(): boolean {
        const normalizedSelection = Array.from(new Set((selectedProjects || []).map(String)));
        const validIds = new Set(projects.map((p) => p.$id));
        const filteredSelection = normalizedSelection.filter((id) => validIds.has(id));
        const isValid = filteredSelection.length === allowedProjectsToKeep;
        showSelectionReminder = !isValid && isLimitExceeded.projects;
        return isValid;
    }

    async function updateSelected() {
        error = null;

        if (!$organization?.$id) {
            error = 'Missing organization ID.';
            return;
        }

        const normalizedSelection = Array.from(new Set((selectedProjects || []).map(String)));
        const validIds = new Set(projects.map((p) => p.$id));
        const filteredSelection = normalizedSelection.filter((id) => validIds.has(id));

        if (filteredSelection.length !== allowedProjectsToKeep) {
            error = `You must select exactly ${allowedProjectsToKeep} projects to keep.`;
            return;
        }

        try {
            await sdk.forConsole.billing.updateSelectedProjects(
                $organization.$id,
                filteredSelection
            );
            showSelectProject = false;
            invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: `Projects updated for archiving`
            });
        } catch (e) {
            console.error('Error updating projects:', e);
            error = e.message || 'Failed to update projects.';
        }
    }
</script>

<Layout.Stack gap="l">
    {#if showSelectionReminder}
        <Alert.Inline status="warning" title="Choose projects to keep">
            The Free plan lets you keep {allowedProjectsToKeep} projects. Select them before continuing.
            <div class="u-mt-2" style="pointer-events: auto; z-index: 10; position: relative;">
                <Button compact on:click={handleManageProjects}>Manage projects</Button>
            </div>
        </Alert.Inline>
    {/if}
    <div class="u-overflow-x-auto">
        <Table.Root
            columns={[
                { id: 'resource' },
                { id: 'freeLimit' },
                { id: 'excessUsage' },
                { id: 'manage' }
            ]}
            let:root>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="resource" {root}>Resource</Table.Header.Cell>
                <Table.Header.Cell column="freeLimit" {root}>Free limit</Table.Header.Cell>
                <Table.Header.Cell column="excessUsage" {root}>
                    <div style="overflow: visible; position: relative;">
                        <Layout.Stack direction="row" alignItems="center" gap="xs">
                            Excess usage
                            <!-- TODO: add tooltip which is not working due to some overflow issue-->
                            <!-- <Tooltip placement="top">
                        <Icon icon={IconInfo} size="s" />
                        <span slot="tooltip">Usage beyond the Free plan limits.</span>
                    </Tooltip> -->
                        </Layout.Stack>
                    </div>
                </Table.Header.Cell>
                <Table.Header.Cell column="manage" {root}></Table.Header.Cell>
            </svelte:fragment>

            <!-- Projects Row -->
            <Table.Row.Base {root}>
                <Table.Cell column="resource" {root}>
                    <div class="u-flex u-items-center u-gap-2 u-flex-wrap">
                        <Typography.Text>Projects</Typography.Text>
                        {#if isLimitExceeded.projects}
                            <Badge
                                size="xs"
                                content="Action required"
                                variant="secondary"
                                type="warning" />
                        {/if}
                    </div>
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
                        <div class="u-w-full u-flex u-justify-end">
                            <div style="pointer-events: auto; z-index: 10; position: relative;">
                                <Button size="xs" secondary on:click={handleManageProjects}>
                                    Manage projects
                                </Button>
                            </div>
                        </div>
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
                        <Typography.Text color="--fgcolor-neutral-secondary">
                            {formatNumber(currentUsage.members)} / {formatNumber(
                                freePlanLimits.members
                            )}
                        </Typography.Text>
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

<Modal bind:show={showSelectProject} title="Manage projects" onSubmit={updateSelected}>
    <svelte:fragment slot="description">
        Choose which two projects to keep. Projects over the limit will be blocked after this date.
    </svelte:fragment>

    {#if error}
        <Alert.Inline status="error" title="Error">{error}</Alert.Inline>
    {/if}

    <div class="u-overflow-x-auto">
        <Table.Root
            let:root
            allowSelection
            bind:selectedRows={selectedProjects}
            columns={[{ id: 'name' }, { id: 'created' }]}>
            <svelte:fragment slot="header" let:root>
                <Table.Header.Cell column="name" {root}>Project Name</Table.Header.Cell>
                <Table.Header.Cell column="created" {root}>Created</Table.Header.Cell>
            </svelte:fragment>
            {#each projects as project}
                <Table.Row.Base {root} id={project.$id}>
                    <Table.Cell column="name" {root}
                        ><Typography.Text truncate>{project.name}</Typography.Text></Table.Cell>
                    <Table.Cell column="created" {root}>
                        {toLocaleDateTime(project.$createdAt)}
                    </Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>
    </div>
    {#if selectedProjects.length === allowedProjectsToKeep}
        <Alert.Inline
            status="warning"
            title={`${projects.length - selectedProjects.length} projects will be archived on ${toLocaleDate(billingProjectsLimitDate)}`}>
            <span>{formatProjectsToArchive()} will be archived</span>
        </Alert.Inline>
    {/if}

    <svelte:fragment slot="footer">
        <div>
            <Button secondary on:click={() => (showSelectProject = false)}>Cancel</Button>
        </div>
        <div>
            <Button submit disabled={selectedProjects.length !== allowedProjectsToKeep}>
                Save
            </Button>
        </div>
    </svelte:fragment>
</Modal>
