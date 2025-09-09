<script lang="ts">
    import { Input } from '@appwrite.io/pink-svelte';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    interface Props {
        values: number[];
        nullable?: boolean;
        deletePoints?: boolean;
        onDeletePoint?: () => void;
        disableDelete?: boolean;
        onChangePoint: (index: number, newValue: number) => void;
    }

    const nullableSkeletonShape: number[] = [0, 0];

    let {
        values,
        nullable = false,
        deletePoints = false,
        disableDelete = false,
        onDeletePoint,
        onChangePoint
    }: Props = $props();
</script>

<Layout.Stack>
    <Layout.Stack direction="row" gap="m">
        {#if nullable}
            {#each nullableSkeletonShape as _, index}
                <Input.Number id={`default-${index}`} placeholder={'0'} disabled={true} />
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
            <Button
                size="s"
                secondary
                disabled={nullable || disableDelete}
                on:click={onDeletePoint}>
                <Icon icon={IconX} size="s" />
            </Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>
