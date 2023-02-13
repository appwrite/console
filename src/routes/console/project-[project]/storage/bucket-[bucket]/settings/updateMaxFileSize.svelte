<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { bytesToSize, sizeToBytes, type Size } from '$lib/helpers/sizeConvertion';
    import { withPrevious } from '$lib/stores/withPrevious';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';

    const options: Array<{ label: string; value: Size }> = [
        { label: 'Bytes', value: 'Bytes' },
        { label: 'Kilobytes', value: 'KB' },
        { label: 'Megabytes', value: 'MB' },
        { label: 'Gigabytes', value: 'GB' }
    ];

    let byteUnit = withPrevious<Size>('Bytes');

    function getInitialMaxSize() {
        const size = $bucket.maximumFileSize;

        // GB
        if (size > 1024 ** 3 && size % 1024 ** 3 === 0) {
            byteUnit.set('GB', { updateAll: true });
            return size / 1024 ** 3;
        }

        // MB
        if (size > 1024 ** 2 && size % 1024 ** 2 === 0) {
            byteUnit.set('MB', { updateAll: true });
            return size / 1024 ** 2;
        }

        // KB
        if (size > 1024 && size % 1024 === 0) {
            byteUnit.set('KB', { updateAll: true });
            return size / 1024;
        }

        // Bytes
        byteUnit.set('Bytes', { updateAll: true });
        return size;
    }

    let maxSize: number = getInitialMaxSize();

    function updateMaxSize() {
        const size = sizeToBytes(maxSize, $byteUnit);
        updateBucket(
            {
                maximumFileSize: size
            },
            {
                trackEventName: 'submit_bucket_update_size',
                arePermsDisabled: false
            }
        );
    }

    byteUnit.subscribe((newValue, prev) => {
        const sizeInBytes = sizeToBytes(maxSize, prev);
        maxSize = bytesToSize(sizeInBytes, newValue);
    });
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
                    bind:value={maxSize} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$byteUnit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={sizeToBytes(maxSize, $byteUnit) === $bucket.maximumFileSize} submit
                >Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
