<script lang="ts">
    import { wizard } from '$lib/stores/wizard';

    /**
     * Pass callback that is run before the Form submit, can be canceled with throwing an exception.
     */
    export let beforeSubmit: () => Promise<void> = null;

    if (beforeSubmit) {
        wizard.setInterceptor(beforeSubmit);
    }
</script>

<header class="form-header">
    <h1 class="heading-level-6">
        <slot name="title" />
    </h1>
    {#if $$slots.subtitle}
        <p>
            <slot name="subtitle" />
        </p>
    {/if}
</header>

<slot />
