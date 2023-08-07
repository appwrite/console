<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createTimeUnitPair } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import LL from '$i18n/i18n-svelte';

    const projectId = $project.$id;
    const { value, unit, baseValue, units } = createTimeUnitPair($project.authDuration);
    const options = units.map((v) => ({ label: v.name, value: v.name }));

    async function updateSessionLength() {
        try {
            await sdk.forConsole.projects.updateAuthDuration(projectId, $baseValue);
            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: $LL.components.notification.projectUserLimitUpdated()
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
    <Heading tag="h2" size="7">{$LL.console.project.title.security.sessionLength()}</Heading>

    <p>
        {$LL.console.project.texts.security.sessionLength()}
    </p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            <ul class="form-list is-multiple">
                <InputNumber
                    id="length"
                    label={$LL.console.project.forms.security.inputs.sessionLength.label()}
                    bind:value={$value}
                    min={0} />
                <InputSelect
                    id="period"
                    label={$LL.console.project.forms.security.inputs.sessionPeriod.label()}
                    bind:value={$unit}
                    {options} />
            </ul>
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={$baseValue === $project.authDuration}
            on:click={() => {
                updateSessionLength();
            }}>
            {$LL.console.project.button.submit.update()}
        </Button>
    </svelte:fragment>
</CardGrid>
