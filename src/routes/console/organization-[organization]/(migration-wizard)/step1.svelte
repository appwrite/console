<script lang="ts">
    import { page } from '$app/stores';
    import { InputSelect } from '$lib/elements/forms';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import { WizardStep } from '$lib/layout';
    import type { Models } from '@appwrite.io/console';

    const projects = $page.data.allProjects as Models.ProjectList;
    const hasProjects = projects.total > 0;

    let projectType = 'existing';

    let selectedProject: string = null;
</script>

<WizardStep>
    <svelte:fragment slot="title">
        {hasProjects ? 'Select project' : 'Create project'}
    </svelte:fragment>
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

    <div class="u-margin-block-start-24">
        {#if projectType === 'existing'}
            <InputSelect
                id="project"
                bind:value={selectedProject}
                label="Select a project"
                options={projects.projects.map((p) => ({
                    label: p.name,
                    value: p.$id
                }))} />
        {:else}
            <InputText
                label="Project name"
                placeholder="Enter project name"
                id="project_name"
                required />
        {/if}
    </div>
</WizardStep>

<style lang="scss">
    .radios {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
</style>
