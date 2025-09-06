<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { NestedNumberArray } from '$lib/helpers/types';
    import InputLine from './inputLine.svelte';

    export let values: NestedNumberArray;
    export let nullable;
    export let onAddPoint: () => void;
    export let onAddLine: () => void;
    export let onDeletePoint: () => void = undefined;

    let required = true;

    $: required = nullable;
</script>

<Layout.Stack>
    {#each values as value}
        <InputLine values={value as number[][]} {onAddPoint} nullable={required} {onDeletePoint} />
    {/each}

    <Layout.Stack direction="row" gap="s" style="margin-top: 8px;">
        <Button compact on:click={onAddLine}>
            <Icon icon={IconPlus} size="s" /> Add line
        </Button>
    </Layout.Stack>
</Layout.Stack>
