<script lang="ts">
    import { Submit } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createByteUnitPair } from '$lib/helpers/unit';
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
</script>

<Form onSubmit={updateMaxSize}>
    <CardGrid>
        <Heading tag="h2" size="7">Maximum file size</Heading>
        <p class="text">Set the maximum file size allowed in the bucket.</p>
        <svelte:fragment slot="aside">
            <ul class="u-flex u-gap-12">
                <InputNumber
                    id="size"
                    label="Size"
                    placeholder={$bucket.maximumFileSize.toString()}
                    min={0}
                    bind:value={$value} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$unit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$baseValue === $bucket.maximumFileSize} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
