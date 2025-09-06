<script lang="ts">
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import InputPoint from './inputPoint.svelte';
    import Button from './button.svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    export let values: number[][];
    export let nullable: boolean;
    export let onAddPoint: () => void;
    export let onDeletePoint: () => void = undefined;

    let required = true;

    $: required = nullable;

    $: disableDeletePoints = !values || values.length <= 2;
</script>

<Layout.Stack alignItems="flex-start">
    <Layout.Stack>
        {#each values as value}
            <InputPoint
                nullable={required}
                values={value}
                deletePoints={true}
                disableDelete={disableDeletePoints}
                {onDeletePoint} />
        {/each}
    </Layout.Stack>
    <Button compact on:click={onAddPoint} disabled={nullable}>
        <Icon icon={IconPlus} size="s" /> Add coordinate
    </Button>
</Layout.Stack>
