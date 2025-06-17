<script lang="ts">
    import { Modal } from '$lib/components';
    import { InputText } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import { page } from '$app/state';
    import { flags } from '$lib/flags';

    export let showOverview = false;
    export let selectedIndex: Models.Index = null;

    const showLengths = flags.showIndexLengths(page.data);
</script>

<Modal title="Overview" bind:show={showOverview}>
    <InputText
        required
        id="key"
        label="Index Key"
        placeholder="Enter Key"
        value={selectedIndex.key}
        readonly />
    <InputText
        required
        id="type"
        label="Index type"
        placeholder="Select type"
        value={selectedIndex.type}
        readonly />

    {#if selectedIndex?.attributes?.length}
        {#each selectedIndex.attributes as attribute, i}
            <Layout.Stack direction="row">
                <InputText
                    required
                    label={i === 0 ? 'Attribute' : ''}
                    id={`value-${attribute}`}
                    value={attribute}
                    readonly />
                <InputText
                    required
                    label={i === 0 ? 'Order' : ''}
                    id={`value-${selectedIndex.orders[i]}`}
                    value={selectedIndex.orders[i]}
                    readonly />
                {#if showLengths}
                    <InputText
                        required
                        label={i === 0 ? 'Length' : ''}
                        id={`value-${selectedIndex.lengths[i]}`}
                        value={selectedIndex.lengths[i]?.toString() ?? null}
                        readonly />
                {/if}
            </Layout.Stack>
        {/each}
    {/if}
</Modal>
