<script lang="ts">
    import { page } from '$app/state';
    import { flags } from '$lib/flags';
    import { InputText } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';

    let {
        selectedIndex = null
    }: {
        selectedIndex: Models.ColumnIndex;
    } = $props();
</script>

<InputText
    required
    id="key"
    label="Index key"
    placeholder="Enter key"
    value={selectedIndex.key}
    readonly />
<InputText
    required
    id="type"
    label="Index type"
    placeholder="Select type"
    value={selectedIndex.type}
    readonly />

{#if selectedIndex?.columns?.length}
    {#each selectedIndex.columns as column, i}
        <Layout.Stack direction="row">
            <InputText
                required
                label={i === 0 ? 'Column' : ''}
                id={`value-${column}`}
                value={column}
                readonly />
            <InputText
                required
                label={i === 0 ? 'Order' : ''}
                id={`value-${selectedIndex.orders[i]}`}
                value={selectedIndex.orders[i]}
                readonly />
            <InputText
                required
                label={i === 0 ? 'Length' : ''}
                id={`value-${selectedIndex.lengths[i]}`}
                value={selectedIndex.lengths[i]?.toString() ?? null}
                readonly />
        </Layout.Stack>
    {/each}
{/if}
