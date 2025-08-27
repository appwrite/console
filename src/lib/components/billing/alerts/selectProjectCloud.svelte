<script lang="ts">
    import { type Models, Query } from '@appwrite.io/console';
    import { Alert, Button, Skeleton, Table } from '@appwrite.io/pink-svelte';
    import { Modal } from '$lib/components';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { billingProjectsLimitDate } from '$lib/stores/billing';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { currentPlan } from '$lib/stores/organization';

    let {
        showSelectProject = $bindable(false),
        selectedProjects = $bindable([]),
        organizationId
    }: {
        showSelectProject: boolean;
        selectedProjects: string[];
        organizationId: string;
    } = $props();

    let loading = $state(false);
    let projectsLoadingError = $state<string | null>(null);

    let error = $state<string | null>(null);
    let projects = $state<Array<Models.Project>>([]);

    let projectsToArchive = $derived(
        projects.filter((project) => !selectedProjects.includes(project.$id))
    );

    async function updateSelected() {
        try {
            await sdk.forConsole.billing.updateSelectedProjects(
                projects[0].teamId,
                selectedProjects
            );

            showSelectProject = false;
            invalidate(Dependencies.ORGANIZATION);
            addNotification({
                type: 'success',
                message: `Projects updated for archiving`
            });
        } catch (e) {
            error = e.message;
        }
    }

    function formatProjectsToArchive() {
        let result = '';

        projectsToArchive.forEach((project, index) => {
            const text = `${index === 0 ? '' : ' '}<b>${project.name}</b> `;
            result += text;

            if (index < projectsToArchive.length - 1) {
                if (index == projectsToArchive.length - 2) {
                    result += 'and ';
                }
                if (index < projectsToArchive.length - 2) {
                    result += ', ';
                }
            }
        });

        return result;
    }

    $effect(() => {
        if (!showSelectProject) return;

        const areProjectsLoaded = projects.length > 0;
        const teamIdInLoadedProjects = areProjectsLoaded ? projects[0].teamId : null;

        if (organizationId != teamIdInLoadedProjects) {
            loading = true;

            sdk.forConsole.projects
                .list({
                    queries: [
                        Query.equal('teamId', organizationId),
                        Query.limit(1000) // Get all projects for organization
                    ]
                })
                .then((loadedProjects) => (projects = loadedProjects.projects))
                .catch((err) => (projectsLoadingError = err.message))
                .finally(() => (loading = false));
        }
    });
</script>

<Modal bind:show={showSelectProject} title="Manage projects" onSubmit={updateSelected}>
    <svelte:fragment slot="description">
        Choose which {$currentPlan?.projects || 2} projects to keep. Projects over the limit will be
        blocked after this date.
    </svelte:fragment>

    {#if loading}
        <div class="skeleton-projects">
            <Table.Root let:root allowSelection columns={[{ id: 'name' }, { id: 'created' }]}>
                <svelte:fragment slot="header" let:root>
                    <Table.Header.Cell column="name" {root}>Project Name</Table.Header.Cell>
                    <Table.Header.Cell column="created" {root}>Created</Table.Header.Cell>
                </svelte:fragment>

                {#each Array.from({ length: 5 }) as _}
                    <Table.Row.Base {root} select="disabled">
                        <Table.Cell column="name" {root}>
                            <Skeleton variant="line" height={20} width="80%" />
                        </Table.Cell>
                        <Table.Cell column="created" {root}>
                            <Skeleton variant="line" height={20} width="80%" />
                        </Table.Cell>
                    </Table.Row.Base>
                {/each}
            </Table.Root>
        </div>
    {:else if projectsLoadingError}
        <Alert.Inline status="error" title="Error">{projectsLoadingError}</Alert.Inline>
    {:else}
        {#if error}
            <Alert.Inline status="error" title="Error">{error}</Alert.Inline>
        {/if}

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
                    <Table.Cell column="name" {root}>{project.name}</Table.Cell>
                    <Table.Cell column="created" {root}
                        >{toLocaleDateTime(project.$createdAt)}</Table.Cell>
                </Table.Row.Base>
            {/each}
        </Table.Root>

        {#if selectedProjects.length > $currentPlan?.projects}
            <div class="u-text-warning u-mb-4">
                You can only select {$currentPlan?.projects} projects. Please deselect others to continue.
            </div>
        {/if}

        {#if selectedProjects.length === $currentPlan?.projects}
            <Alert.Inline
                status="warning"
                title={`${projects.length - selectedProjects.length} projects will be archived on ${toLocaleDate(billingProjectsLimitDate)}`}>
                <span>
                    {@html formatProjectsToArchive()}
                    will be archived.
                </span>
            </Alert.Inline>
        {/if}
    {/if}
    <svelte:fragment slot="footer">
        <Button.Button size="s" variant="secondary" on:click={() => (showSelectProject = false)}
            >Cancel</Button.Button>
        <Button.Button size="s" disabled={selectedProjects.length !== $currentPlan?.projects}
            >Save</Button.Button>
    </svelte:fragment>
</Modal>

<style lang="scss">
    /* disable the top select all selector button */
    .skeleton-projects :global([role='rowheader'] button) {
        opacity: 0.4;
        cursor: default;
        pointer-events: none;
        background: var(--bgcolor-neutral-tertiary);
    }
</style>
