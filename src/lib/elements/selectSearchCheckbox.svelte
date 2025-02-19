<script lang="ts">
    import { ActionMenu, Layout } from '@appwrite.io/pink-svelte';
    import InputCheckbox from './forms/inputCheckbox.svelte';

    export let value = false;
    export let padding: number | null = null;
</script>

<ActionMenu.Item.Button on:click>
    <Layout.Stack direction="row" gap="xs" alignItems="center">
        <InputCheckbox bind:checked={value} id="filter" size="s" />
        <!-- <button
            class="drop-button u-flex u-cross-center u-gap-12"
            style:--button-padding-horizontal={padding ? `${padding / 16}rem` : ''}
            style:--button-padding-vertical={padding ? `${padding / 16}rem` : ''}
            on:click|preventDefault
            type="button">
        </button> -->
        <slot />
    </Layout.Stack>
</ActionMenu.Item.Button>
