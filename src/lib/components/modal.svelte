<script lang="ts">
    import { beforeNavigate } from '$app/navigation';
    import { disableCommands } from '$lib/commandCenter';
    import { Form } from '$lib/elements/forms';
    import { Alert, Layout, Modal } from '@appwrite.io/pink-svelte';
    import DOMPurify from 'dompurify';

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
    export let backdrop: boolean = true;

    let alert: HTMLElement;

    beforeNavigate(() => {
        if (autoClose) show = false;
    });

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }

    // Melt UI's ComboBox (and other listbox-based components) call removeScroll()
    // when they open, which adds overflow:hidden + compensatory padding-right
    $: if (typeof document !== 'undefined') {
        if (show) {
            document.body.setAttribute('data-melt-scroll-lock', '');
        } else {
            document.body.removeAttribute('data-melt-scroll-lock');
        }
    }
</script>

<Form isModal {onSubmit}>
    <div class:modal-no-backdrop={!backdrop}>
        <Modal {size} {title} bind:open={show} {hideFooter} {dismissible}>
            <slot slot="description" name="description" />
            {#if error}
                <div bind:this={alert} class="alert-error">
                    <Alert.Inline
                        dismissible
                        status="warning"
                        on:dismiss={() => {
                            error = null;
                        }}>
                        {@html DOMPurify.sanitize(error, {
                            ALLOWED_TAGS: ['a'],
                            ALLOWED_ATTR: ['href']
                        }).replace(/<a /g, '<a rel="noopener noreferrer" ')}
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
    </div>
</Form>

<style>
    /* temporary fix to modal width */
    :global(dialog section) {
        max-width: 100% !important;
    }

    :global(.modal-no-backdrop dialog::backdrop) {
        background: transparent;
        opacity: 0;
        animation: none;
    }

    .alert-error :global(a) {
        color: inherit;
        text-decoration: underline;
    }
</style>
