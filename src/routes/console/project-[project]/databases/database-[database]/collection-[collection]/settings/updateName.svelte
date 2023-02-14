<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForProject } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { collection } from '../store';

    const databaseId = $page.params.database;

    let collectionName: string = null;

    onMount(() => {
        collectionName ??= $collection.name;
    });

    async function updateName() {
        try {
            await sdkForProject.databases.updateCollection(
                databaseId,
                $collection.$id,
                collectionName,
                $collection.$permissions,
                $collection.documentSecurity,
                $collection.enabled
            );
            invalidate(Dependencies.COLLECTION);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.CollectionUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.CollectionUpdateName);
        }
    }
</script>

<Form on:submit={updateName}>
    <CardGrid>
        <Heading tag="h6" size="7">Update Name</Heading>

        <svelte:fragment slot="aside">
            <ul>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Enter name"
                    autocomplete={false}
                    bind:value={collectionName} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={collectionName === $collection.name || !collectionName} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
