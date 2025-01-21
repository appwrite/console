<script lang="ts">
    import { Alert } from '$lib/components';
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';
    import { beforeNavigate } from '$app/navigation';
    import { Layout, Modal } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let icon: string = null;
    export let state: 'success' | 'warning' | 'error' | 'info' = null;
    export let error: string = null;
    export let closable = true;
    export let headerDivider = true;
    export let open = false;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';
    export let hideFooter = false;

    let alert: HTMLElement;
    let formComponent: Form;

    beforeNavigate(() => {
        show = false;
    });

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            event.preventDefault();
            formComponent.triggerSubmit();
        }
    }

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<Form isModal {onSubmit} bind:this={formComponent}>
    <Modal {title} bind:open={show} {hideFooter}>
        <svelte:fragment slot="description">
            <slot name="description" />
        </svelte:fragment>
        {#if error}
            <div bind:this={alert}>
                <Alert
                    dismissible
                    type="warning"
                    on:dismiss={() => {
                        error = null;
                    }}>
                    {error}
                </Alert>
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
