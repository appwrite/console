<script context="module" lang="ts">
    import type { Writable } from 'svelte/store';

    export type FormContext = {
        isSubmitting: Writable<boolean>;
    };
</script>

<script lang="ts">
    import { setContext } from 'svelte';
    import { writable } from 'svelte/store';

    export let noMargin = false;
    export let noStyle = false;
    export let isModal = false;
    export let onSubmit: () => Promise<void> | void;

    const { isSubmitting } = setContext<FormContext>('form', {
        isSubmitting: writable(false)
    });

    async function submit() {
        isSubmitting.set(true);
        await onSubmit();
        isSubmitting.set(false);
    }
</script>

<form
    class:form={!noStyle}
    class:common-section={!noMargin}
    class:modal-form={isModal}
    on:submit|preventDefault={submit}>
    <slot />
</form>
