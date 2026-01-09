<script lang="ts">
    import { InputText } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { getTerminologies, type Index } from '$database/(entity)';

    let {
        selectedIndex = null
    }: {
        selectedIndex: Index;
    } = $props();

    const { terminology } = getTerminologies();
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

{#if selectedIndex?.fields?.length}
    {#each selectedIndex.fields as field, i}
        <Layout.Stack direction="row">
            <InputText
                required
                label={i === 0 ? entityType : ''}
                id={`value-${field}`}
                value={field}
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
