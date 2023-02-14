<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { createValueUnitPair, type Unit } from '$lib/helpers/unit';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';

    const units: Array<Unit> = [
        { name: 'Bytes', value: 1 },
        { name: 'Kilobytes', value: 1024 },
        { name: 'Megabytes', value: 1024 ** 2 },
        { name: 'Gigabytes', value: 1024 ** 3 }
    ];
    const { value, unit, baseValue } = createValueUnitPair($bucket.maximumFileSize, units);

    const options = units.map((v) => ({ label: v.name, value: v.name }));

    function updateMaxSize() {
        updateBucket(
            {
                maximumFileSize: $baseValue
            },
            {
                trackEventName: 'submit_bucket_update_size',
                arePermsDisabled: false
            }
        );
    }
</script>

<Form on:submit={updateMaxSize}>
    <CardGrid>
        <Heading tag="h2" size="6">Update Maximum File Size</Heading>
        <p class="text">Set the maximum file size allowed in the bucket.</p>
        <svelte:fragment slot="aside">
            <ul class="u-flex u-gap-12">
                <InputNumber
                    id="size"
                    label="Size"
                    placeholder={$bucket.maximumFileSize.toString()}
                    bind:value={$value} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$unit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$baseValue === $bucket.maximumFileSize} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
