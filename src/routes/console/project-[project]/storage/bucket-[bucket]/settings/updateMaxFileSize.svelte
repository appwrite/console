<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import type { Size } from '$lib/helpers/sizeConvertion';
    import { createValueUnitPair } from '$lib/helpers/unit';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';

    const options: Array<{ label: string; value: Size }> = [
        { label: 'Bytes', value: 'Bytes' },
        { label: 'Kilobytes', value: 'KB' },
        { label: 'Megabytes', value: 'MB' },
        { label: 'Gigabytes', value: 'GB' }
    ];

    const {
        value: maxSize,
        unit: byteUnit,
        baseValue: baseMaxSize
    } = createValueUnitPair($bucket.maximumFileSize, [
        { name: 'Bytes', value: 1 },
        { name: 'KB', value: 1024 },
        { name: 'MB', value: 1024 ** 2 },
        { name: 'GB', value: 1024 ** 3 }
    ]);

    function updateMaxSize() {
        updateBucket(
            {
                maximumFileSize: $baseMaxSize
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
                    bind:value={$maxSize} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$byteUnit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={$baseMaxSize === $bucket.maximumFileSize} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
