<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createValueUnitPair, type Unit } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;

    const units: Unit[] = [
        { name: 'Days', value: 86400 },
        { name: 'Hours', value: 3600 },
        { name: 'Minutes', value: 60 },
        { name: 'Seconds', value: 1 }
    ];
    const { value, unit, baseValue } = createValueUnitPair($project.authDuration, units);

    const options = units.map((v) => ({ label: v.name, value: v.name }));

    async function updateSessionLength() {
        try {
            await sdkForConsole.projects.updateAuthDuration(projectId, $baseValue);
            invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
            trackEvent(Submit.SessionsLengthUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.SessionsLengthUpdate);
        }
    }
</script>

<CardGrid>
    <Heading tag="h2" size="6">Session Length</Heading>

    <p>
        If you reduce the limit, users who are currently logged in will be logged out of the
        application.
    </p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            <ul class="form-list is-multiple">
                <InputNumber id="length" label="Length" bind:value={$value} />
                <InputSelect id="period" label="Time Period" bind:value={$unit} {options} />
            </ul>
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={$baseValue === $project.authDuration}
            on:click={() => {
                updateSessionLength();
            }}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
