<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID, Region as ConsoleRegion } from '@appwrite.io/console';
    import { createProject } from './wizard/store';
    import { Button } from '@appwrite.io/pink-svelte';
    import { base } from '$app/paths';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { Modal } from '$lib/components';
    import type { Region } from '$lib/sdk/billing';

    const teamId = $page.params.organization;
    export let regions: Array<Region> = [];
    export let showCreateProjectCloud: boolean;

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            // TODO: fix typing once SDK is updated
            const project = await sdk.forConsole.projects.create(
                $createProject?.id ?? ID.unique(),
                $createProject.name,
                teamId,
                $createProject.region as ConsoleRegion
            );
            trackEvent(Submit.ProjectCreate, {
                customId: !!$createProject?.id,
                teamId,
                region: $createProject.region
            });
            addNotification({
                type: 'success',
                message: `${$createProject.name} has been created`
            });
            await onFinish();
            await goto(`${base}/project-${project.$id}`);
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.ProjectCreate);
        }
    }

    onDestroy(() => {
        $createProject = {
            id: null,
            name: null,
            region: 'fra'
        };
    });
</script>

<Modal bind:show={showCreateProjectCloud} title={'Create project'} onSubmit={create}>
    <CreateProject
        showTitle={false}
        bind:id={$createProject.id}
        bind:projectName={$createProject.name}
        bind:region={$createProject.region}
        {regions}>
        <svelte:fragment slot="footer">
            <Button.Button type="submit" variant="primary" size="s">Create</Button.Button>
        </svelte:fragment>
    </CreateProject>
</Modal>
