<script lang="ts">
    import { ActionMenu, Layout } from '@appwrite.io/pink-svelte';
    import InputCheckbox from './forms/inputCheckbox.svelte';

    export let value = false;
    export let padding: number | null = null;
</script>

<ActionMenu.Item.Button on:click>
    <Layout.Stack direction="row" gap="xs" alignItems="center">
        <InputCheckbox bind:checked={value} id="filter" size="s" />

        <slot />
    </Layout.Stack>
</ActionMenu.Item.Button>
