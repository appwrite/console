<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createTimeUnitPair } from '$lib/helpers/unit';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { project } from '../../store';
    import { Layout } from '@appwrite.io/pink-svelte';

    const { value, unit, baseValue, units } = createTimeUnitPair($project?.authDuration);
    const options = units.map((v) => ({ label: v.name, value: v.name }));

    async function updateSessionLength() {
        try {
            await sdk.forConsole.projects.updateAuthDuration($project.$id, $baseValue);
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
    <svelte:fragment slot="title">Session length</svelte:fragment>
    If you reduce the limit, users who are currently logged in will be logged out of the application.
    <svelte:fragment slot="aside">
        <Layout.Stack direction="row">
            <InputNumber required id="length" label="Length" bind:value={$value} min={0} />
            <InputSelect required id="period" label="Time period" bind:value={$unit} {options} />
        </Layout.Stack>
    </svelte:fragment>
    <svelte:fragment slot="actions">
        <Button disabled={$baseValue === $project.authDuration} on:click={updateSessionLength}>
            Update
        </Button>
    </svelte:fragment>
</CardGrid>
