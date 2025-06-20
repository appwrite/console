<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { ID, type Models, Region as ConsoleRegion, Region } from '@appwrite.io/console';
    import { base } from '$app/paths';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { Modal } from '$lib/components';
    import { Button } from '$lib/elements/forms';

    export let showCreateProjectCloud: boolean;
    export let regions: Array<Models.ConsoleRegion> = [];

    let id: string = null;
    let error: string = null;
    let name: string = 'New project';
    let region: ConsoleRegion = Region.Fra;

    let showSubmissionLoader = false;
    const teamId = page.params.organization;

    function onFinish() {
        addNotification({ type: 'success', message: `${name} has been created` });
        trackEvent(Submit.ProjectCreate, { customId: !!id, teamId, region: region });
    }

    async function create() {
        showSubmissionLoader = true;

        try {
            // TODO: fix typing once SDK is updated
            const project = await sdk.forConsole.projects.create(
                id ?? ID.unique(),
                name,
                teamId,
                region
            );

            onFinish();
            await goto(`${base}/project-${project.region}-${project.$id}`);
        } catch (e) {
            error = e.message;
            trackError(e, Submit.ProjectCreate);
        } finally {
            showSubmissionLoader = false;
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
    <CreateProject showTitle={false} bind:id bind:projectName={name} bind:region {regions} />
    <svelte:fragment slot="footer">
        <Button
            submit
            size="s"
            forceShowLoader={showSubmissionLoader}
            submissionLoader={showSubmissionLoader}>Create</Button>
    </svelte:fragment>
</Modal>
