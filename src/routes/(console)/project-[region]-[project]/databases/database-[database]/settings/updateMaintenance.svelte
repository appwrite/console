<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSelect, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { DedicatedDatabase, MaintenanceDay } from '$lib/sdk/dedicatedDatabases';

    let {
        database
    }: {
        database: DedicatedDatabase;
    } = $props();

    const dayOptions: { value: MaintenanceDay; label: string }[] = [
        { value: 'sun', label: 'Sunday' },
        { value: 'mon', label: 'Monday' },
        { value: 'tue', label: 'Tuesday' },
        { value: 'wed', label: 'Wednesday' },
        { value: 'thu', label: 'Thursday' },
        { value: 'fri', label: 'Friday' },
        { value: 'sat', label: 'Saturday' }
    ];

    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: `${String(i).padStart(2, '0')}:00 UTC`
    }));

    let day: MaintenanceDay = $state(database.maintenanceWindowDay);
    let hourUtc: number = $state(database.maintenanceWindowHourUtc);
    let durationMinutes: number = $state(database.maintenanceWindowDurationMinutes);

    const hasChanges = $derived(
        day !== database.maintenanceWindowDay ||
            hourUtc !== database.maintenanceWindowHourUtc ||
            durationMinutes !== database.maintenanceWindowDurationMinutes
    );

    async function updateMaintenance() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .dedicatedDatabases.updateMaintenance(database.$id, {
                    day,
                    hourUtc,
                    durationMinutes
                });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Maintenance window has been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateMaintenance);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateMaintenance);
        }
    }
</script>

<Form onSubmit={updateMaintenance}>
    <CardGrid>
        <svelte:fragment slot="title">Maintenance window</svelte:fragment>
        Schedule a preferred time window for automatic maintenance operations such as minor
        version upgrades and patches.
        <svelte:fragment slot="aside">
            <ul>
                <InputSelect
                    id="maintenanceDay"
                    label="Day"
                    bind:value={day}
                    options={dayOptions} />
                <InputSelect
                    id="maintenanceHour"
                    label="Hour (UTC)"
                    bind:value={hourUtc}
                    options={hourOptions} />
                <InputNumber
                    id="maintenanceDuration"
                    label="Duration (minutes)"
                    min={30}
                    max={480}
                    bind:value={durationMinutes}
                    required />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
