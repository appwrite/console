<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { NestedNumberArray } from '$lib/helpers/types';
    import InputLine from './inputLine.svelte';

    export let values: NestedNumberArray;
    export let nullable;
    export let onAddPoint: (index: number) => void;
    export let onAddLine: (index: number) => void;
    export let onDeletePoint: (index: number) => void = undefined;
    export let disableDeletePointsCountPerLine: number = 4;

    let required = true;

    $: required = nullable;
</script>

<Layout.Stack>
    {#each values as value, index}
        <InputLine
            values={value as number[][]}
            onAddPoint={() => onAddPoint(index)}
            nullable={required}
            onDeletePoint={() => onDeletePoint(index)}
            {disableDeletePointsCountPerLine} />
    {/each}

    <Layout.Stack direction="row" gap="s" style="margin-top: 8px;">
        <Button compact on:click={() => onAddLine(-1)}>
            <Icon icon={IconPlus} size="s" /> Add line
        </Button>
    </Layout.Stack>
</Layout.Stack>
