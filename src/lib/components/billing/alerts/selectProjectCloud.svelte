<script lang="ts">
    import { type Models } from '@appwrite.io/console';
    import { Alert, Button, Table } from '@appwrite.io/pink-svelte';
    import { Modal } from '$lib/components';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { addNotification } from '$lib/stores/notifications';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { billingProjectsLimitDate } from '$lib/stores/billing';
    import { page } from '$app/state';
    import { toLocaleDate, toLocaleDateTime } from '$lib/helpers/date';
    import { currentPlan } from '$lib/stores/organization';

    let {
        showSelectProject = $bindable(false),
        selectedProjects = $bindable([])
    }: {
        showSelectProject: boolean;
        selectedProjects: string[];
    } = $props();

    let projects = $state<Array<Models.Project>>([]);
    let error = $state<string | null>(null);

    onMount(() => {
        projects = page.data.allProjects?.projects || [];
    });

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
</script>

<Modal bind:show={showSelectProject} title={'Manage projects'} onSubmit={updateSelected}>
    <svelte:fragment slot="description">
        Choose which two projects to keep. Projects over the limit will be blocked after this date.
    </svelte:fragment>
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
    <svelte:fragment slot="footer">
        <Button.Button size="s" variant="secondary" on:click={() => (showSelectProject = false)}
            >Cancel</Button.Button>
        <Button.Button size="s" disabled={selectedProjects.length !== $currentPlan?.projects}
            >Save</Button.Button>
    </svelte:fragment>
</Modal>
