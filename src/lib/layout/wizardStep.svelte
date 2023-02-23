<script lang="ts">
    import { Heading } from '$lib/components';
    import { wizard } from '$lib/stores/wizard';

    /**
     * Pass callback that is run before the Form submit, can be canceled with throwing an exception.
     */
    export let beforeSubmit: () => Promise<void> = null;

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
    .hide-divider {
        padding-block-end: 0;
        border-block-end: none;
    }
</style>
