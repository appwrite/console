<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { page } from '$app/state';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputSwitch, InputNumber } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';

    let {
        database
    }: {
        database: Models.DedicatedDatabase;
    } = $props();

    let autoscaling: boolean = $state(database.storageAutoscaling);
    let thresholdPercent: number = $state(database.storageAutoscalingThresholdPercent);
    let maxGb: number = $state(database.storageAutoscalingMaxGb);

    const hasChanges = $derived(
        autoscaling !== database.storageAutoscaling ||
            thresholdPercent !== database.storageAutoscalingThresholdPercent ||
            maxGb !== database.storageAutoscalingMaxGb
    );

    async function updateAutoscaling() {
        try {
            await sdk.forProject(page.params.region, page.params.project).compute.updateDatabase({
                databaseId: database.$id,
                storageAutoscaling: autoscaling,
                storageAutoscalingThresholdPercent: autoscaling ? thresholdPercent : undefined,
                storageAutoscalingMaxGb: autoscaling ? maxGb : undefined
            });

            await invalidate(Dependencies.DATABASE);

            addNotification({
                message: 'Storage autoscaling settings have been updated',
                type: 'success'
            });

            trackEvent(Submit.DatabaseUpdateAutoscaling);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.DatabaseUpdateAutoscaling);
        }
    }
</script>

<Form onSubmit={updateAutoscaling}>
    <CardGrid>
        <svelte:fragment slot="title">Storage autoscaling</svelte:fragment>
        Automatically increase storage when disk usage reaches a threshold. Storage will never exceed
        the configured maximum.
        <svelte:fragment slot="aside">
            <ul>
                <InputSwitch
                    id="autoscaling"
                    label="Enable storage autoscaling"
                    bind:value={autoscaling} />
                {#if autoscaling}
                    <InputNumber
                        id="threshold"
                        label="Usage threshold (%)"
                        min={50}
                        max={95}
                        bind:value={thresholdPercent}
                        required />
                    <InputNumber
                        id="maxGb"
                        label="Maximum storage (GB)"
                        min={database.storage}
                        max={10000}
                        bind:value={maxGb}
                        required />
                {/if}
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={!hasChanges} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
