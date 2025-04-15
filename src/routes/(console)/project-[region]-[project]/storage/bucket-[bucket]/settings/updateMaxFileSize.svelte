<script lang="ts">
    import { Submit } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { BillingPlan } from '$lib/constants';
    import { Button, Form, FormItem, InputNumber, InputSelect } from '$lib/elements/forms';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { createByteUnitPair } from '$lib/helpers/unit';
    import { readOnly, upgradeURL } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { GRACE_PERIOD_OVERRIDE, isCloud } from '$lib/system';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';
    import type { Plan } from '$lib/sdk/billing';
    export let currentPlan: Plan | null;

    const service = currentPlan?.['fileSize'];
    const { value, unit, baseValue, units } = createByteUnitPair($bucket.maximumFileSize, 1000);
    const options = units.map((v) => ({ label: v.name, value: v.name }));
    $: selectedUnit = $unit;

    $: maxValue = function formMaxFileSize() {
        return (service * 1000 * 1000) / units.find((unit) => unit.name === selectedUnit).value;
    };

    function updateMaxSize() {
        updateBucket(
            {
                maximumFileSize: $baseValue
            },
            {
                trackEventName: Submit.BucketUpdateSize,
                arePermsDisabled: false
            }
        );
    }
</script>

<Form onSubmit={updateMaxSize}>
    <CardGrid>
        <Heading tag="h2" size="7">Maximum file size</Heading>
        <p class="text">Set the maximum file size allowed in the bucket.</p>
        <svelte:fragment slot="aside">
            {#if isCloud}
                {@const size = humanFileSize(sizeToBytes(service, 'MB', 1000))}
                <Alert type="info">
                    <p class="text">
                        The {currentPlan.name} plan has a maximum upload file size limit of {Math.floor(
                            parseInt(size.value)
                        )}{size.unit}.
                        {#if $organization?.billingPlan === BillingPlan.FREE}
                            Upgrade to allow files of a larger size.
                        {/if}
                    </p>
                    <svelte:fragment slot="action">
                        {#if $organization?.billingPlan === BillingPlan.FREE}
                            <div class="alert-buttons u-flex">
                                <Button text href={$upgradeURL}>Upgrade plan</Button>
                            </div>
                        {/if}
                    </svelte:fragment>
                </Alert>
            {/if}
            <FormItem isMultiple>
                <InputNumber
                    isMultiple
                    fullWidth
                    id="size"
                    label="Size"
                    disabled={$readOnly && !GRACE_PERIOD_OVERRIDE}
                    placeholder={$bucket.maximumFileSize.toString()}
                    min={0}
                    max={isCloud ? maxValue() : Infinity}
                    bind:value={$value} />
                <InputSelect
                    id="bytes"
                    label="Bytes"
                    isMultiple
                    fullWidth
                    {options}
                    bind:value={$unit} />
            </FormItem>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button
                disabled={$baseValue === $bucket.maximumFileSize ||
                    ($readOnly && !GRACE_PERIOD_OVERRIDE)}
                submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
