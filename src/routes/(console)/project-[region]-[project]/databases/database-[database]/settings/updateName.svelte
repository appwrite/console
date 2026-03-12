<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase } from '$lib/sdk/dedicatedDatabases';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    let databaseName: string = $state(database.name);

    async function updateName() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.update(database.$id, { name: databaseName });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Database name has been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                id="name"
                label="Name"
                placeholder="Enter database name"
                autocomplete={false}
                bind:value={databaseName}
                required />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={databaseName === database.name || !databaseName} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
