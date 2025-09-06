<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    let nullableSkeletonShape: number[] = [0, 0];
    export let values: number[];
    export let nullable = false;
    export let deletePoints = false;
    export let onDeletePoint: () => void = undefined;
    export let disableDelete = false;
    export let onChangePoint: (index: number, newValue: number) => void;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" gap="s">
        {#if nullable}
            {#each nullableSkeletonShape as _, index}
                <Input.Number id={`default-${index}`} placeholder="Enter value" disabled={true} />
            {/each}
        {:else}
            {#each values as _, index}
                <Input.Number
                    id={`point-${index}`}
                    placeholder="Enter value"
                    step={0.001}
                    value={values[index]}
                    on:change={(e) => onChangePoint(index, Number.parseFloat(`${e.detail}`))} />
            {/each}
        {/if}
        {#if deletePoints}
            <Button secondary disabled={nullable || disableDelete} on:click={onDeletePoint}>
                <Icon icon={IconX} size="s" />
            </Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>
