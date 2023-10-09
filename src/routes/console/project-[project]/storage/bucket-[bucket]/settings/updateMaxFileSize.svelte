<script lang="ts">
    import { Submit } from '$lib/actions/analytics';
    import { Alert, CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { createByteUnitPair } from '$lib/helpers/unit';
    import { getServiceLimit, readOnly } from '$lib/stores/billing';
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

    const service = getServiceLimit('storage');
</script>

<Form onSubmit={updateMaxSize}>
    <CardGrid>
        <Heading tag="h2" size="7">Maximum file size</Heading>
        <p class="text">Set the maximum file size allowed in the bucket.</p>
        <svelte:fragment slot="aside">
            {#if isCloud && $organization?.billingPlan === 'tier-0'}
                {@const size = humanFileSize(service?.amount)}
                <Alert type="info">
                    <p class="text">
                        The Free plan has a maximum upload file size limit of {size.value}{size.unit}.
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
            <ul class="u-flex u-gap-12 u-width-full-line">
                <InputNumber
                    id="size"
                    label="Size"
                    disabled={$readOnly}
                    placeholder={$bucket.maximumFileSize.toString()}
                    min={0}
                    max={isCloud ? service.amount : Infinity}
                    bind:value={$value} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$unit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$baseValue === $bucket.maximumFileSize || $readOnly} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
