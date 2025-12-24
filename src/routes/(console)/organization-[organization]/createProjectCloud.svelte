<script lang="ts">
    import { resolve } from '$app/paths';
    import { onDestroy } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';
    import { goto, invalidate } from '$app/navigation';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { ID, type Models, Region } from '@appwrite.io/console';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    let {
        teamId,
        projects,
        showCreateProjectCloud = $bindable(),
        regions = [],
        currentPlan = undefined
    }: {
        teamId: string;
        projects: number;
        showCreateProjectCloud: boolean;
        regions: Array<Models.ConsoleRegion>;
        currentPlan?: Models.BillingPlan;
    } = $props();

    let error = $state(null);
    let projectId = $state(ID.unique());
    let projectRegion = $state(Region.Fra);
    let projectName = $state('New project');

    let showSubmissionLoader = $state(false);

    const projectIdForLog = $derived(projectId);

    async function create() {
        let project: Models.Project;

        showSubmissionLoader = true;

        try {
            project = await sdk.forConsole.projects.create({
                projectId: projectId ?? ID.unique(),
                name: projectName,
                teamId,
                region: projectRegion
            });

            await goto(
                resolve('/(console)/project-[region]-[project]', {
                    region: project.region,
                    project: project.$id
                })
            );

            trackEvent(Submit.ProjectCreate, {
                teamId,
                region: projectRegion,
                customId: projectId !== projectIdForLog
            });
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        } finally {
            showSubmissionLoader = false;

            if (project) {
                // reload projects for nav breadcrumb!
                await invalidate(Dependencies.ORGANIZATION);
            }
        }
    }

    onDestroy(() => {
        error = null;
        projectId = ID.unique();
        projectName = 'New project';
        projectRegion = Region.Fra;
        showCreateProjectCloud = false;
    });
</script>

<Modal
    bind:error
    autoClose={false}
    onSubmit={create}
    title="Create project"
    bind:show={showCreateProjectCloud}>
    <CreateProject
        {regions}
        {projects}
        {currentPlan}
        showTitle={false}
        bind:projectName
        bind:id={projectId}
        bind:region={projectRegion} />

    <svelte:fragment slot="footer">
        <Button
            submit
            size="s"
            disabled={currentPlan.projects > 0 && projects && projects >= currentPlan?.projects}
            forceShowLoader={showSubmissionLoader}
            submissionLoader={showSubmissionLoader}>Create</Button>
    </svelte:fragment>
</Modal>
