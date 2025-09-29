<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import type { Models } from '@appwrite.io/console';
    import type { TerminologyResult } from '$database/(entity)';

    let {
        terminology,
        selectedIndex = null
    }: {
        terminology: TerminologyResult;
        selectedIndex: Models.ColumnIndex;
    } = $props();

    const entityType = terminology.entity.title.singular;
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

<!-- TODO: could be attributes or columns -->
{#if selectedIndex?.columns?.length}
    {#each selectedIndex.columns as column, i}
        <Layout.Stack direction="row">
            <InputText
                required
                label={i === 0 ? entityType : ''}
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
