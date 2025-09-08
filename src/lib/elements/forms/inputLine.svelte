<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import InputPoint from './inputPoint.svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let values: number[][];
    export let nullable: boolean;
    export let disableDeletePointsIndex: number = 2;
    export let disableDeleteLine: boolean|undefined = undefined;
    export let onAddPoint: (index: number) => void;
    export let onDeletePoint: (index: number) => void = undefined;
    export let onChangePoint: (pointIndex: number, coordIndex: number, newValue: number) => void =
        undefined;

    function handlePointChange(pointIndex: number, coordIndex: number, newValue: number) {
        if (onChangePoint) {
            onChangePoint(pointIndex, coordIndex, newValue);
        }
    }

    function isDeleteDisabled(index: number) {
        let disable = index < disableDeletePointsIndex;
        if (disableDeleteLine !== undefined) {
            disable = disable && disableDeleteLine;
        }
        return disable;
    }
</script>

<Layout.Stack alignItems="flex-start">
    <Layout.Stack>
        {#each values as value, index}
            <InputPoint
                nullable={nullable}
                values={value}
                deletePoints={true}
                disableDelete={isDeleteDisabled(index)}
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
