<script lang="ts">
    import { InputPoint } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { getDefaultSpatialData } from '../../../store';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    interface Props {
        label: string;
        value: number[];
        limited: boolean;
        column: Models.ColumnPoint;
    }

    let { label, value = $bindable(), limited = false, column }: Props = $props();

    function handlePointChange(index: number, newValue: number) {
        if (value) {
            value[index] = newValue;
            value = [...value];
        }
    }

    function handleAddDefault() {
        value = getDefaultSpatialData('point') as number[];
    }

    const nullable = $derived(!limited ? !column.required : false);
</script>

<Layout.Stack>
    <Layout.Stack direction="row" justifyContent="space-between" alignItems="center">
        <Layout.Stack direction="row" alignItems="center" gap="s">
            <Typography.Text variant="m-500">{label}</Typography.Text>
            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                {#if nullable}
                    optional
                {:else}
                    Point
                {/if}
            </Typography.Text>
        </Layout.Stack>
        {#if !value}
            <Button secondary on:click={handleAddDefault}>
                <Icon icon={IconPlus} slot="start" size="s" />
                Add Point
            </Button>
        {/if}
    </Layout.Stack>

    <InputPoint values={value} nullable={false} onChangePoint={handlePointChange} />
</Layout.Stack>
