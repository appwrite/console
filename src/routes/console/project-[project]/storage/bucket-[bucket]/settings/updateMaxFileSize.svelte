<script lang="ts">
    import { Submit } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormItem, InputNumber, InputSelect } from '$lib/elements/forms';
    import { humanFileSize, sizeToBytes } from '$lib/helpers/sizeConvertion';
    import { createByteUnitPair } from '$lib/helpers/unit';
    import { getServiceLimit, readOnly, tierToPlan } from '$lib/stores/billing';
    import { organization } from '$lib/stores/organization';
    import { wizard } from '$lib/stores/wizard';
    import { isCloud } from '$lib/system';
    import ChangeOrganizationTierCloud from '$routes/console/changeOrganizationTierCloud.svelte';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';

    const { value, unit, baseValue, units } = createByteUnitPair($bucket.maximumFileSize);
    const options = units.map((v) => ({ label: v.name, value: v.name }));

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

    const service = getServiceLimit('fileSize');
</script>

<Form onSubmit={updateMaxSize}>
    <CardGrid>
        <Heading tag="h2" size="7">Maximum file size</Heading>
        <p class="text">Set the maximum file size allowed in the bucket.</p>
        <svelte:fragment slot="aside">
            {#if isCloud}
                {@const size = humanFileSize(sizeToBytes(service, 'MB', 1024))}
                {@const plan = tierToPlan($organization?.billingPlan)}
                <Alert type="info">
                    <p class="text">
                        The {plan.name} plan has a maximum upload file size limit of {size.value}{size.unit}.
                        Upgrade to allow files of a larger size.
                    </p>
                    <svelte:fragment slot="action">
                        <div class="alert-buttons u-flex">
                            <Button text on:click={() => wizard.start(ChangeOrganizationTierCloud)}>
                                Upgrade plan
                            </Button>
                        </div>
                    </svelte:fragment>
                </Alert>
            {/if}
            <FormItem isMultiple>
                <InputNumber
                    isMultiple
                    fullWidth
                    id="size"
                    label="Size"
                    disabled={$readOnly}
                    placeholder={$bucket.maximumFileSize.toString()}
                    min={0}
                    max={isCloud ? service : Infinity}
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
            <Button disabled={$baseValue === $bucket.maximumFileSize || $readOnly} submit>
                Update
            </Button>
        </svelte:fragment>
    </CardGrid>
</Form>
