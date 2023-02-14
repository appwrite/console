<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { timeToSeconds } from '$lib/helpers/timeConversion';
    import { createValueUnitPair } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdkForConsole } from '$lib/stores/sdk';
    import { project } from '../../store';

    enum Period {
        Days = 'd',
        Hours = 'h',
        Minutes = 'm',
        Seconds = 's'
    }

    const projectId = $project.$id;
    const options = [
        { label: 'days', value: Period.Days },
        { label: 'hours', value: Period.Hours },
        { label: 'minutes', value: Period.Minutes },
        { label: 'seconds', value: Period.Seconds }
    ];

    const {
        value: time,
        unit: period,
        baseValue: timeInSecs
    } = createValueUnitPair($project.authDuration, [
        { name: Period.Days, value: 86400 },
        { name: Period.Hours, value: 3600 },
        { name: Period.Minutes, value: 60 },
        { name: Period.Seconds, value: 1 }
    ]);

    async function updateSessionLength() {
        try {
            await sdkForConsole.projects.updateAuthDuration(projectId, $timeInSecs);
            invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated project users limit successfully'
            });
            trackEvent('submit_session_length_update');
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
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
                <InputNumber id="length" label="Length" bind:value={$time} />
                <InputSelect id="period" label="Time Period" bind:value={$period} {options} />
            </ul>
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={timeToSeconds($time, $period) === $project.authDuration}
            on:click={() => {
                updateSessionLength();
            }}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
