<script lang="ts">
    import { type Models } from '@appwrite.io/console';
    import { Alert, Button, Table } from '@appwrite.io/pink-svelte';
    import { Modal } from '$lib/components';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';

    export let showSelectProject: boolean;
    export let projects: Array<Models.Project> = [];

    onMount(() => {
        sdk.forConsole.projects
            .list()
            .then((response) => {
                projects = response.projects || [];
            })
            .catch((error) => {
                console.error('Failed to fetch projects:', error);
            });
    });

    let selectedProjects: Array<string> = [];

    let projectsToArchive: Array<Models.Project> = [];

    $: projectsToArchive = projects.filter((project) => !selectedProjects.includes(project.$id));

    function updateSelected() {
        showSelectProject = false;
        // Here you can handle the selected project, e.g., save it to a store or navigate
        console.log(selectedProjects);
    }
</script>

<Modal bind:show={showSelectProject} title={'Manage projects'} onSubmit={updateSelected}>
    <svelte:fragment slot="description">
        Choose which two projects over will be blocked after this date.
    </svelte:fragment>
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
                    >{new Date(project.$createdAt).toLocaleDateString()}
                    {new Date(project.$createdAt).toLocaleTimeString()}</Table.Cell>
            </Table.Row.Base>
        {/each}
    </Table.Root>
    {#if selectedProjects.length > 2}
        <div class="u-text-warning u-mb-4">
            You can only select two projects. Please deselect others to continue.
        </div>
    {/if}
    {#if selectedProjects.length === 2}
        <Alert.Inline
            status="warning"
            title={`${projects.length - selectedProjects.length} projects will be archived on [date]`}>
            {#each projectsToArchive as project, index}{@const text = `<b>${project.name}</b>`}
                {@html text}{index == projectsToArchive.length - 2
                    ? ', and '
                    : index < projectsToArchive.length - 1
                      ? ', '
                      : ''}
            {/each} will be archived.
        </Alert.Inline>
    {/if}
    <svelte:fragment slot="footer">
        <Button.Button variant="secondary" on:click={() => (showSelectProject = false)}
            >Cancel</Button.Button>
        <Button.Button disabled={selectedProjects.length !== 2}>Save</Button.Button>
    </svelte:fragment>
</Modal>
