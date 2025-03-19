<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/stores';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputCron } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import { onMount } from 'svelte';
    import { func } from '../store';
    import { isValueOfStringEnum } from '$lib/helpers/types';
    import { Runtime } from '@appwrite.io/console';
    import { Link } from '$lib/elements';

    const functionId = $page.params.function;
    let functionSchedule: string = null;

    onMount(async () => {
        functionSchedule ??= $func.schedule;
    });

    async function updateSchedule() {
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
                functionSchedule,
                $func.timeout || undefined,
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
                message: 'Cron Schedule has been updated'
            });
            trackEvent(Submit.FunctionUpdateSchedule);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.FunctionUpdateSchedule);
        }
    }
</script>

<Form onSubmit={updateSchedule}>
    <CardGrid>
        <svelte:fragment slot="title">Schedule</svelte:fragment>
        Set a Cron schedule to trigger your function. Leave blank for no schedule.
        <Link href="https://appwrite.io/docs/products/functions/execution#schedule" external>
            Learn more</Link
        >.
        <svelte:fragment slot="aside">
            <InputCron bind:value={functionSchedule} label="Schedule (Cron syntax)" id="schedule" />
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$func.schedule === functionSchedule} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
