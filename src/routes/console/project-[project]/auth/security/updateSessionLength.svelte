<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';
    import { createTimeUnitPair } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';

    const projectId = $project.$id;
    const { value, unit, baseValue, units } = createTimeUnitPair($project.authDuration);
    const options = units.map((v) => ({ label: v.name, value: v.name }));
    let renewal = $project.authRenewal ?? false;

    async function updateSessionLength() {
        try {
            await sdk.forConsole.projects.updateAuthDuration(projectId, $baseValue, renewal);
            await invalidate(Dependencies.PROJECT);

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
    <Heading tag="h2" size="7" id="session-length">Session length</Heading>

    <p>
        If you reduce the limit, users who are currently logged in will be logged out of the
        application.
    </p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            <ul class="form-list is-multiple">
                <InputNumber id="length" label="Length" bind:value={$value} min={0} />
                <InputSelect id="period" label="Time Period" bind:value={$unit} {options} />
              
            </ul>
            <ul class="form-list">
              <div>
                <InputSwitch
                bind:value={renewal}
                id="passwordDictionary"
                label="Automatic renewal" />
    
                <p class="text">
                    When enabled, sessions are automatically extended to session duration on every request.
                </p></div>
            </ul>
          
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={$baseValue === $project.authDuration && renewal === $project.authRenewal}
            on:click={() => {
                updateSessionLength();
            }}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
