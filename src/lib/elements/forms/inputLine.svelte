<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import InputPoint from './inputPoint.svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import type { Snippet } from 'svelte';

    type Props = {
        values: number[][];
        nullable?: boolean;
        minDeletableIndex?: number;
        allowLineDelete?: boolean;
        onAddPoint: (index: number) => void;
        onDeletePoint: (index: number) => void;
        onChangePoint: (pointIndex: number, coordIndex: number, newValue: number) => void;
        addLineButton?: Snippet;
    };

    let {
        values,
        nullable = false,
        minDeletableIndex = 2,
        allowLineDelete,
        onAddPoint,
        onDeletePoint,
        onChangePoint,
        addLineButton
    }: Props = $props();

    function handlePointChange(pointIndex: number, coordIndex: number, newValue: number) {
        onChangePoint?.(pointIndex, coordIndex, newValue);
    }

    function isDeleteDisabled(index: number) {
        let disable = index < minDeletableIndex;
        if (allowLineDelete !== undefined) {
            disable = disable && allowLineDelete;
        }
        return disable;
    }
</script>

<Layout.Stack alignItems="flex-start" gap="xs">
    <Layout.Stack>
        {#each values as value, index}
            <InputPoint
                {nullable}
                values={value}
                deletePoints={true}
                disableDelete={isDeleteDisabled(index)}
                onDeletePoint={() => onDeletePoint(index)}
                onChangePoint={(coordIndex, newValue) =>
                    handlePointChange(index, coordIndex, newValue)} />
        {/each}
    </Layout.Stack>

    {#if values}
        <Layout.Stack direction="row" gap="s" alignItems="center">
            <Button size="xs" compact on:click={() => onAddPoint(-1)} disabled={nullable}>
                <Icon icon={IconPlus} size="s" /> Add coordinate
            </Button>
            {@render addLineButton?.()}
        </Layout.Stack>
    {/if}
</Layout.Stack>
