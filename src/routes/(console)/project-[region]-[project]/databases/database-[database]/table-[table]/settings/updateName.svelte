<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputText } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { table } from '../store';

    const databaseId = page.params.database;

    let tableName: string = null;

    onMount(() => {
        tableName ??= $table.name;
    });

    async function updateName() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateTable(
                    databaseId,
                    $table.$id,
                    tableName,
                    $table.$permissions,
                    $table.rowSecurity,
                    $table.enabled
                );
            await invalidate(Dependencies.TABLE);
            addNotification({
                message: 'Name has been updated',
                type: 'success'
            });
            trackEvent(Submit.TableUpdateName);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TableUpdateName);
        }
    }
</script>

<Form onSubmit={updateName}>
    <CardGrid>
        <svelte:fragment slot="title">Name</svelte:fragment>
        <svelte:fragment slot="aside">
            <InputText
                required
                id="name"
                label="Name"
                placeholder="Enter name"
                autocomplete={false}
                bind:value={tableName} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={tableName === $table.name || !tableName} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
