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
    export let onChangePoint: (
        lineIndex: number,
        pointIndex: number,
        coordIndex: number,
        newValue: number
    ) => void = undefined;
    export let minDeletableIndex: number = 4;

    function handlePointChange(
        lineIndex: number,
        pointIndex: number,
        coordIndex: number,
        newValue: number
    ) {
        if (onChangePoint) {
            onChangePoint(lineIndex, pointIndex, coordIndex, newValue);
        }
    }

    function handleAddLineInternal() {
        if (onAddLine) {
            onAddLine(-1);
        }
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
                <svelte:fragment slot="line-button">
                    {#if index === values.length - 1}
                        <Button
                            disabled={nullable}
                            size="xs"
                            compact
                            on:click={handleAddLineInternal}>
                            <Icon icon={IconPlus} size="s" /> Add line
                        </Button>
                    {/if}
                </svelte:fragment>
            </InputLine>
        </Layout.Stack>
    {/each}
</Layout.Stack>
