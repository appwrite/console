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
    export let addCoordinate: () => void;

    let required = true;

    $: required = showDefaults;
</script>

<Layout.Stack>
    <Layout.Stack>
        {#each values || defaultValues as value, index}
            <InputPoint showDefaults={required} values={value} />
        {/each}
    </Layout.Stack>
    <Layout.Stack direction="row" gap="s" style="margin-top: 8px;">
        <Button compact on:click={addCoordinate}>
            <Icon icon={IconPlus} size="s" /> Add coordinate
        </Button>
    </Layout.Stack>
</Layout.Stack>
