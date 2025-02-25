<script lang="ts">
    import { Heading } from '$lib/components';
    import { wizard } from '$lib/stores/wizard';
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

<header class="form-header" class:hide-divider={!$$slots.subtitle}>
    <Heading tag="h1" size="6">
        <slot name="title" />
    </Heading>
    {#if $$slots.subtitle}
        <p>
            <slot name="subtitle" />
        </p>
    {/if}
</header>

<slot />

<style>
    header {
        margin-block-end: 1.25rem;
    }

    .hide-divider {
        padding-block-end: 0;
        border-block-end: none;
    }
</style>
