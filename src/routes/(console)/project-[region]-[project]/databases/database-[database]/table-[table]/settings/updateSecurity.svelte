<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackEvent, trackError } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputSwitch } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { table } from '../store';

    const databaseId = page.params.database;

    let tableRowSecurity: boolean = null;

    onMount(() => {
        tableRowSecurity ??= $table.rowSecurity;
    });

    async function updateSecurity() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .grids.updateTable(
                    databaseId,
                    $table.$id,
                    $table.name,
                    $table.$permissions,
                    tableRowSecurity,
                    $table.enabled
                );
            await invalidate(Dependencies.TABLE);
            addNotification({
                message: 'Security has been updated',
                type: 'success'
            });
            trackEvent(Submit.TableUpdateSecurity);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.TableUpdateSecurity);
        }
    }
</script>

<CardGrid>
    <svelte:fragment slot="title">Row security</svelte:fragment>
    <svelte:fragment slot="aside">
        <InputSwitch bind:value={tableRowSecurity} id="security" label="Row security" />

        <p class="text">
            When row security is enabled, users will be able to access rows for which they have been
            granted <b>either row or table permissions</b>.
        </p>
        <p class="text">
            If row security is disabled, users can access rows <b
                >only if they have table permissions</b
            >. Row permissions will be ignored.
        </p>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button disabled={tableRowSecurity === $table.rowSecurity} on:click={updateSecurity}
            >Update</Button>
    </svelte:fragment>
</CardGrid>
