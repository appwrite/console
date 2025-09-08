<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import InputPoint from './inputPoint.svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let values: number[][];
    export let nullable: boolean;
    export let disableDeletePointsCountPerLine: number = 2;
    export let onAddPoint: (index: number) => void;
    export let onDeletePoint: (index: number) => void = undefined;
    export let onChangePoint: (pointIndex: number, coordIndex: number, newValue: number) => void =
        undefined;

    let disableDeletePoints = false;
    $: disableDeletePoints = !values || values.length <= disableDeletePointsCountPerLine;

    function handlePointChange(pointIndex: number, coordIndex: number, newValue: number) {
        if (onChangePoint) {
            onChangePoint(pointIndex, coordIndex, newValue);
        }
    }
</script>

<Layout.Stack alignItems="flex-start">
    <Layout.Stack>
        {#each values as value, index}
            <InputPoint
                nullable={nullable}
                values={value}
                deletePoints={true}
                disableDelete={disableDeletePoints}
                onDeletePoint={() => onDeletePoint(index)}
                onChangePoint={(coordIndex, newValue) =>
                    handlePointChange(index, coordIndex, newValue)} />
        {/each}
    </Layout.Stack>
    {#if values}
        <Button compact on:click={() => onAddPoint(-1)} disabled={nullable}>
            <Icon icon={IconPlus} size="s" /> Add coordinate
        </Button>
        
    {/if}
</Layout.Stack>
