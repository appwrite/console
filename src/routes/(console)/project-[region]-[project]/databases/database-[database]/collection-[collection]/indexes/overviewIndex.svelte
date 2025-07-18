<script lang="ts">
    import { page } from '$app/state';
    import { flags } from '$lib/flags';
    import { InputText } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        selectedIndex = null
    }: {
        selectedIndex: Models.Index;
    } = $props();

    const showLengths = flags.showIndexLengths(page.data);
</script>

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
                label={i === 0 ? 'Column' : ''}
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
