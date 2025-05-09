<script lang="ts">
    import { wizard } from '$lib/stores/wizard';
    import { Layout, Typography } from '@appwrite.io/pink-svelte';
    import { onDestroy } from 'svelte';

    /**
     * Pass callback that is run before the Form submit, can be canceled with throwing an exception.
     */
    export let beforeSubmit: () => Promise<void> = null;
    export let nextDisabled = false;

    $: wizard.setNextDisabled(nextDisabled);

    onDestroy(() => {
        wizard.setNextDisabled(false);
    });

    if (beforeSubmit) {
        wizard.setInterceptor(beforeSubmit);
    }
</script>

<Layout.Stack>
    <header class="form-header" class:hide-divider={!$$slots.subtitle}>
        <Typography.Title><slot name="title" /></Typography.Title>
        {#if $$slots.subtitle}
            <p>
                <slot name="subtitle" />
            </p>
        {/if}
    </header>

    <slot />
</Layout.Stack>

<style>
    header {
        margin-block-end: 1.25rem;
    }

    .hide-divider {
        padding-block-end: 0;
        border-block-end: none;
    }
</style>
