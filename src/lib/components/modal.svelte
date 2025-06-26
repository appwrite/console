<script lang="ts">
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';
    import { beforeNavigate } from '$app/navigation';
    import { Alert, Layout, Modal } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let autoClose = true;
    export let error: string = null;
    export let dismissible = true;
    export let size: 's' | 'm' | 'l' = 'm';
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';
    export let hideFooter = false;
    export let autoFocus = true;

    let alert: HTMLElement;

    beforeNavigate(() => {
        if (autoClose) show = false;
    });

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }

    $: if (show && autoFocus) {
        setTimeout(() => {
            focusFirstElement();
        }, 100);
    }

    function focusFirstElement() {
        const modalDialog = document.querySelector('dialog[open]') as HTMLElement;
        if (!modalDialog) return;

        const autofocusElement = modalDialog.querySelector('[autofocus]') as HTMLElement;
        if (autofocusElement) {
            autofocusElement.focus();
            return;
        }
        const activeElement = document.activeElement;
        if (activeElement && modalDialog.contains(activeElement)) {
            return;
        }
        const focusableSelectors = [
            'input:not([disabled]):not([readonly]):not([type="hidden"])',
            'textarea:not([disabled]):not([readonly])',
            'select:not([disabled])',
            'button:not([disabled])',
            'a[href]:not([disabled])',
            '[tabindex]:not([tabindex="-1"]):not([disabled])',
            '.card-selector:not([disabled])',
            '[role="button"]:not([disabled])',
            '[role="link"]:not([disabled])',
            '[contenteditable="true"]:not([disabled])'
        ].join(', ');

        const firstFocusable = modalDialog.querySelector(focusableSelectors) as HTMLElement;
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }
</script>

<Form isModal {onSubmit}>
    <Modal {size} {title} bind:open={show} {hideFooter} {dismissible}>
        <slot slot="description" name="description" />
        {#if error}
            <div bind:this={alert}>
                <Alert.Inline
                    dismissible
                    status="warning"
                    on:dismiss={() => {
                        error = null;
                    }}>
                    {error}
                </Alert.Inline>
            </div>
        {/if}
        <slot />
        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" justifyContent="flex-end">
                <slot name="footer" />
            </Layout.Stack>
        </svelte:fragment>
    </Modal>
</Form>

<style>
    /* temporary fix to modal width */
    :global(dialog section) {
        max-width: 100% !important;
    }
</style>
