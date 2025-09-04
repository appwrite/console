<script lang="ts">
    import InputNumber from './inputNumber.svelte';
    import { Layout } from '@appwrite.io/pink-svelte';

    let defaultValues: number[] = [0, 0];
    export let values: number[];
    export let showDefaults;
</script>

<Layout.Stack>
    <Layout.Stack direction="row" gap="s">
        {#if showDefaults}
            {#each defaultValues as _, index}
                <InputNumber id={`default-${index}`} placeholder="Enter value" disabled={true} />
            {/each}
        {:else}
            {#each values as value, index}
                <InputNumber
                    id={`point-${index}`}
                    placeholder="Enter value"
                    bind:value={value as number}
                    step={0.001} />
            {/each}
        {/if}
    </Layout.Stack>
</Layout.Stack>
