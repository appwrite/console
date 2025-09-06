<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import InputPoint from './inputPoint.svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let defaultValues: number[][] = [
        [0, 0],
        [0, 0]
    ];
    export let values: number[][];
    export let showDefaults;
    export let onAddPoint: () => void;
    export let onDeletePoint: () => void = undefined;

    let required = true;

    $: required = showDefaults;

    $: disableDeletePoints = !values || values.length <= 2;
</script>

<Layout.Stack>
    <Layout.Stack>
        {#each values || defaultValues as value}
            <InputPoint
                showDefaults={required}
                values={value}
                deletePoints={true}
                disableDelete={disableDeletePoints}
                {onDeletePoint} />
        {/each}
    </Layout.Stack>
    <Layout.Stack direction="row" gap="s" style="margin-top: 8px;">
        <Button compact on:click={onAddPoint}>
            <Icon icon={IconPlus} size="s" /> Add coordinate
        </Button>
    </Layout.Stack>
</Layout.Stack>
