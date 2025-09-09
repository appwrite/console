<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { NestedNumberArray } from '$lib/helpers/types';
    import InputLine from './inputLine.svelte';

    type Props = {
        values: NestedNumberArray;
        nullable?: boolean;
        minDeletableIndex?: number;
        onAddPoint: (index: number) => void;
        onAddLine?: (index: number) => void;
        onDeletePoint: (index: number) => void;
        onChangePoint: (
            lineIndex: number,
            pointIndex: number,
            coordIndex: number,
            newValue: number
        ) => void;
    };

    let {
        values,
        nullable = false,
        minDeletableIndex = 4,
        onAddPoint,
        onAddLine,
        onDeletePoint,
        onChangePoint
    }: Props = $props();

    function handlePointChange(
        lineIndex: number,
        pointIndex: number,
        coordIndex: number,
        newValue: number
    ) {
        onChangePoint?.(lineIndex, pointIndex, coordIndex, newValue);
    }

    function handleAddLineInternal() {
        onAddLine?.(-1);
    }
</script>

<Layout.Stack gap="s">
    {#each values as value, index}
        <Layout.Stack gap="xs">
            <InputLine
                values={value as number[][]}
                onAddPoint={() => onAddPoint(index)}
                {nullable}
                onDeletePoint={() => onDeletePoint(index)}
                onChangePoint={(pointIndex, coordIndex, newValue) =>
                    handlePointChange(index, pointIndex, coordIndex, newValue)}
                allowLineDelete={index < 2}
                {minDeletableIndex}>
                {#snippet addLineButton()}
                    {#if index === values.length - 1}
                        <Button
                            disabled={nullable}
                            size="xs"
                            compact
                            on:click={handleAddLineInternal}>
                            <Icon icon={IconPlus} size="s" /> Add line
                        </Button>
                    {/if}
                {/snippet}
            </InputLine>
        </Layout.Stack>
    {/each}
</Layout.Stack>
