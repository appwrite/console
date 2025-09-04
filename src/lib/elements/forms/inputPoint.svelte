<script lang="ts">
    import InputNumber from './inputNumber.svelte';
    import { Layout, Icon } from '@appwrite.io/pink-svelte';
    import Button from './button.svelte';
    import { IconX } from '@appwrite.io/pink-icons-svelte';

    let defaultValues: number[] = [0, 0];
    export let values: number[];
    export let showDefaults;
    export let deletePoints = false;
    export let onDeletePoint: () => void = undefined;
    export let disableDelete = false;
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
        {#if deletePoints}
            <Button secondary disabled={showDefaults || disableDelete} on:click={onDeletePoint}>
                <Icon icon={IconX} size="s" />
            </Button>
        {/if}
    </Layout.Stack>
</Layout.Stack>
