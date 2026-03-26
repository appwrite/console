<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        InputSwitch,
        InputCron,
        InputNumber
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let backupEnabled: boolean = $state(database.backupEnabled);
    let backupPitr: boolean = $state(database.backupPitr);
    let backupCron: string = $state(database.backupCron ?? '0 2 * * *');
    let backupRetentionDays: number = $state(database.backupRetentionDays);

    const hasChanges = $derived(
        backupEnabled !== database.backupEnabled ||
            backupPitr !== database.backupPitr ||
            backupCron !== (database.backupCron ?? '0 2 * * *') ||
            backupRetentionDays !== database.backupRetentionDays
    );

    async function updateBackups() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .compute.updateDatabase({
                    databaseId: database.$id,
                    backupEnabled,
                    backupPitr: backupEnabled ? backupPitr : false,
                    backupCron: backupEnabled ? backupCron : undefined,
                    backupRetentionDays: backupEnabled ? backupRetentionDays : undefined
                });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Backup settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateBackups);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateBackups);
        }
    }
</script>

<Form onSubmit={updateBackups}>
    <CardGrid>
        <svelte:fragment slot="title">Backups</svelte:fragment>
        Configure automatic backups and point-in-time recovery for your database.
        <svelte:fragment slot="aside">
            <ul>
                <InputSwitch
                    id="backupEnabled"
                    label="Enable automatic backups"
                    bind:value={backupEnabled} />
                {#if backupEnabled}
                    <InputSwitch
                        id="backupPitr"
                        label="Enable point-in-time recovery (PITR)"
                        bind:value={backupPitr} />
                    <InputCron
                        id="backupCron"
                        label="Backup schedule"
                        bind:value={backupCron}
                        required />
                    <InputNumber
                        id="backupRetention"
                        label="Retention (days)"
                        min={1}
                        max={365}
                        bind:value={backupRetentionDays}
                        required />
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
