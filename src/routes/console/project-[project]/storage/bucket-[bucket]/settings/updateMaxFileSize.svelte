<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, InputNumber, InputSelect } from '$lib/elements/forms';
    import { sizeToBytes, type Size } from '$lib/helpers/sizeConvertion';
    import { writable } from 'svelte/store';
    import { bucket } from '../store';
    import { updateBucket } from './+page.svelte';

    const options: Array<{ label: string; value: Size }> = [
        { label: 'Bytes', value: 'Bytes' },
        { label: 'Kilobytes', value: 'KB' },
        { label: 'Megabytes', value: 'MB' },
        { label: 'Gigabytes', value: 'GB' }
    ];

    let byteUnit = writable<Size>('MB');

    function getInitialMaxSize() {
        const size = $bucket.maximumFileSize;

        // GB
        if (size > 1024 ** 3 && size % 1024 ** 3 === 0) {
            byteUnit.set('GB');
            return size / 1024 ** 3;
        }

        // MB
        if (size > 1024 ** 2 && size % 1024 ** 2 === 0) {
            byteUnit.set('MB');
            return size / 1024 ** 2;
        }

        // KB
        if (size > 1024 && size % 1024 === 0) {
            byteUnit.set('KB');
            return size / 1024;
        }

        // Bytes
        byteUnit.set('Bytes');
        return size;
    }

    let maxSize: number = getInitialMaxSize();
    let sizeInBytes: number = maxSize ? sizeToBytes(maxSize, $byteUnit) : null;

    function updateMaxSize() {
        const size = sizeToBytes(maxSize, $byteUnit);
        console.log(size, maxSize, $byteUnit);
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

    byteUnit.subscribe((b) => {
        if (b === 'Bytes') {
            maxSize = sizeInBytes;
        } else if (b === 'KB') {
            maxSize = sizeInBytes / 1024;
        } else if (b === 'MB') {
            maxSize = sizeInBytes / 1024 / 1024;
        } else if (b === 'GB') {
            maxSize = sizeInBytes / 1024 / 1024 / 1024;
        }
    });

    $: if (maxSize) {
        sizeInBytes = sizeToBytes(maxSize, $byteUnit);
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
                    bind:value={maxSize} />
                <InputSelect id="bytes" label="Bytes" {options} bind:value={$byteUnit} />
            </ul>
        </svelte:fragment>

        <svelte:fragment slot="actions">
            <Button disabled={sizeInBytes === $bucket.maximumFileSize} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
