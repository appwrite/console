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

    const projectId = $project.$id;
    console.log('Project: ', $project);
    const { value, unit, baseValue, units } = createTimeUnitPair($project.jwtExpiration);
    const options = units.map((v) => ({ label: v.name, value: v.name }));

    async function updateJwtExpiration() {
        try {
            await sdk.forConsole.projects.updateJwtExpiration(projectId, $baseValue);
            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'Updated project JWT expiration successfully'
            });
            trackEvent(Submit.JwtExpirationUpdate);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.JwtExpirationUpdate);
        }
    }
</script>

<CardGrid>
    <Heading tag="h2" size="7" id="session-length">JWT expiration</Heading>

    <p>
        The time limit after which a JWT becomes invalid and can no longer be used for
        authentication or authorization purposes.
    </p>
    <svelte:fragment slot="aside">
        <form class="form u-grid u-gap-16">
            <ul class="form-list is-multiple">
                <InputNumber id="jwt-length" label="Length" bind:value={$value} min={0} />
                <InputSelect id="jwt-period" label="Time Period" bind:value={$unit} {options} />
            </ul>
        </form>
    </svelte:fragment>

    <svelte:fragment slot="actions">
        <Button
            disabled={$baseValue === $project.jwtExpiration}
            on:click={() => {
                updateJwtExpiration();
            }}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
