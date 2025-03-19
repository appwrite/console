<script lang="ts">
    import { page } from '$app/stores';
    import { InputSelect } from '$lib/elements/forms';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import { Query, type Models, ID } from '@appwrite.io/console';
    import { selectedProject } from '.';
    import { sdk } from '$lib/stores/sdk';

    const organizations = $page.data.organizations
        .teams as Models.TeamList<Models.Preferences>['teams'];
    let selectedOrg = organizations.length ? organizations[0].$id : null;

    let projects = [] as Models.ProjectList['projects'];
    let loadingProjects = false;

    let projectType = 'existing';
    let newProjName = '';

    async function getProjects(orgId: string | null) {
        if (!orgId) {
            projects = [];
        } else {
            loadingProjects = true;
            projects = await sdk.forConsole.projects
                .list([Query.equal('teamId', orgId), Query.orderDesc('$createdAt')])
                .then((res) => res.projects);
            projectType = projects.length ? 'existing' : 'new';
            loadingProjects = false;
        }
    }

    $: {
        getProjects(selectedOrg);
    }

    const beforeSubmit = async () => {
        if (projectType === 'existing') return;
        const project = await sdk.forConsole.projects.create(ID.unique(), newProjName, selectedOrg);
        selectedProject.set(project.$id);
    };
</script>

<WizardStep {beforeSubmit}>
    <svelte:fragment slot="title">Project</svelte:fragment>

    {#if organizations.length > 1}
        <InputSelect
            id="organization"
            bind:value={selectedOrg}
            label="Select organization"
            options={organizations.map((p) => ({
                label: p.name,
                value: p.$id
            }))}
            disabled={loadingProjects} />
    {/if}

    {#if selectedOrg && !loadingProjects}
        {#if projects.length}
            <div class="radios">
                <div class="u-flex u-gap-8">
                    <input
                        type="radio"
                        name="project_type"
                        id="project_type--existing"
                        bind:group={projectType}
                        value="existing" />
                    <label for="project_type--existing">
                        <p class="u-bold">Existing project</p>
                        <p>Import data to an existing project</p>
                    </label>
                </div>
                <div class="u-flex u-gap-8">
                    <input
                        type="radio"
                        name="project_type"
                        id="project_type--new"
                        bind:group={projectType}
                        value="new" />
                    <label for="project_type--new">
                        <p class="u-bold">Create new project</p>
                        <span>Import data to a new project</span>
                    </label>
                </div>
            </div>
        {/if}

        <div>
            {#if projectType === 'existing'}
                <InputSelect
                    id="project"
                    bind:value={$selectedProject}
                    label="Select a project"
                    options={projects.map((p) => ({
                        label: p.name,
                        value: p.$id
                    }))} />
            {:else}
                <InputText
                    label="Project name"
                    placeholder="Enter project name"
                    id="project_name"
                    bind:value={newProjName}
                    required />
            {/if}
        </div>
    {/if}
</WizardStep>

<style lang="scss">
    .radios {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
</style>
