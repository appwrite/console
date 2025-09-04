<script lang="ts">
    import type { NestedNumberArray } from '$lib/helpers/types';
    import InputNumber from './inputNumber.svelte';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';

    export let defaultValues: number[] = [0, 0];
    export let values: NestedNumberArray = [];
    export let showDefaults = false;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" alignItems="center" gap="s">
        <Typography.Text variant="m-600">Default</Typography.Text>
        <Typography.Caption variant="400">Optional</Typography.Caption>
    </Layout.Stack>

    <Layout.Stack direction="row" gap="s">
        {#if showDefaults}
            {#each defaultValues as _, index}
                <InputNumber
                    id={`default-${index}`}
                    placeholder="Enter value"
                    bind:value={defaultValues[index]}
                    disabled={true} />
            {/each}
        {:else}
            {#each values as value, index}
                <InputNumber
                    id={`value-${index}`}
                    placeholder="Enter value"
                    bind:value={value as number}
                    step={0.001} />
            {/each}
        {/if}
    </Layout.Stack>
</Layout.Stack>
