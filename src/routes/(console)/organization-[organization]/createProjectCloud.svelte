<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { goto, invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { ID, type Models, Region as ConsoleRegion, Region } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { Modal } from '$lib/components';
    import { currentPlan } from '$lib/stores/organization';
    import { Button } from '$lib/elements/forms';
    import { Dependencies } from '$lib/constants';

    export let teamId: string;
    export let projects: number;
    export let showCreateProjectCloud: boolean;
    export let regions: Array<Models.ConsoleRegion> = [];

    let id: string = null;
    let error: string = null;
    let name: string = 'New project';
    let region: ConsoleRegion = Region.Fra;

    let showSubmissionLoader = false;

    async function create() {
        let project: Models.Project;

        showSubmissionLoader = true;

        try {
            project = await sdk.forConsole.projects.create({
                projectId: id ?? ID.unique(),
                name,
                teamId,
                region
            });

            await goto(`${base}/project-${project.region}-${project.$id}`);
            trackEvent(Submit.ProjectCreate, { customId: !!id, teamId, region: region });
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
        id = null;
        name = null;
        error = null;
        region = Region.Fra;
        showCreateProjectCloud = false;
    });
</script>

<Modal
    bind:show={showCreateProjectCloud}
    autoClose={false}
    title={'Create project'}
    onSubmit={create}
    bind:error>
    <CreateProject
        {projects}
        showTitle={false}
        bind:id
        bind:projectName={name}
        bind:region
        {regions} />
    <svelte:fragment slot="footer">
        <Button
            submit
            size="s"
            disabled={$currentPlan.projects > 0 && projects && projects >= $currentPlan?.projects}
            forceShowLoader={showSubmissionLoader}
            submissionLoader={showSubmissionLoader}>Create</Button>
    </svelte:fragment>
</Modal>
