<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, FormList, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';

    const functionId = $page.params.function;
    let timeout: number = null;

    onMount(async () => {
        timeout ??= $func.timeout;
    });

    async function updateTimeout() {
        try {
            if (!isValueOfStringEnum(Runtime, $func.runtime)) {
                throw new Error(`Invalid runtime: ${$func.runtime}`);
            }
            await sdk.forProject.functions.update(
                functionId,
                $func.name,
                $func.runtime,
                $func.execute || undefined,
                $func.events || undefined,
                $func.schedule || undefined,
                timeout,
                $func.enabled || undefined,
                $func.logging || undefined,
                $func.entrypoint || undefined,
                $func.commands || undefined,
                $func.scopes || undefined,
                $func.installationId || undefined,
                $func.providerRepositoryId || undefined,
                $func.providerBranch || undefined,
                $func.providerSilentMode || undefined,
                $func.providerRootDirectory || undefined
            );
            await invalidate(Dependencies.FUNCTION);
            addNotification({
                type: 'success',
                message: 'Timeout has been updated'
            });
            trackEvent(Submit.FunctionUpdateTimeout);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateTimeout);
        }
    }
</script>

<Form onSubmit={updateTimeout}>
    <CardGrid>
        <svelte:fragment slot="title">Timeout</svelte:fragment>
        Limit the execution time of your function. The maximum value is 900 seconds (15 minutes).
        <svelte:fragment slot="aside">
            <InputNumber
                min={1}
                max={900}
                id="time"
                label="Time (in seconds)"
                bind:value={timeout} />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$func.timeout === timeout || timeout < 1} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
