<script lang="ts">
    import { Alert } from '$lib/components';
    import { trackEvent } from '$lib/actions/analytics';
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';
    import { beforeNavigate } from '$app/navigation';
    import { Layout, Modal } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let size: 'small' | 'big' | 'huge' = null;
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
    export let description = '';

    let alert: HTMLElement;

    beforeNavigate(() => {
        show = false;
    });

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<Modal {title} {description} bind:open={show}>
    <Form isModal {onSubmit}>
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
    </Form>
    <svelte:fragment slot="footer">
        <Layout.Stack direction="row" justifyContent="flex-end">
            <slot name="footer" />
        </Layout.Stack>
    </svelte:fragment>
</Modal>
