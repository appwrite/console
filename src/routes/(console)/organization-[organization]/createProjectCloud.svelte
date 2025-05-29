<script lang="ts">
    import { sdk } from '$lib/stores/sdk';
    import { onDestroy } from 'svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { ID, Region as ConsoleRegion, type Models, Region } from '@appwrite.io/console';
    import { Button } from '@appwrite.io/pink-svelte';
    import CreateProject from '$lib/layout/createProject.svelte';
    import { Modal } from '$lib/components';
    import { getProjectRoute } from '$lib/helpers/project';

    const teamId = page.params.organization;
    export let regions: Array<Models.ConsoleRegion> = [];
    export let showCreateProjectCloud: boolean;

    let id: string = null;
    let name: string = 'Appwrite project';
    let region: ConsoleRegion = Region.Fra;

    async function onFinish() {
        await invalidate(Dependencies.FUNCTIONS);
    }

    async function create() {
        try {
            // TODO: fix typing once SDK is updated
            await sdk.forConsole.projects.create(id ?? ID.unique(), name, teamId, region);
            trackEvent(Submit.ProjectCreate, {
                customId: !!id,
                teamId,
                region: region
            });
            addNotification({
                type: 'success',
                message: `${name} has been created`
            });
            await onFinish();
            await goto(getProjectRoute());
        } catch (e) {
            addNotification({
                type: 'error',
                message: e.message
            });
            trackError(e, Submit.ProjectCreate);
        }
    }

    onDestroy(() => {
        id = null;
        name = null;
        region = ConsoleRegion.Fra;
    });
</script>

<Modal bind:show={showCreateProjectCloud} title={'Create project'} onSubmit={create}>
    <CreateProject showTitle={false} bind:id bind:projectName={name} bind:region {regions}>
    </CreateProject>
    <svelte:fragment slot="footer">
        <Button.Button type="submit" variant="primary" size="s">Create</Button.Button>
    </svelte:fragment>
</Modal>
