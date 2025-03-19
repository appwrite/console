<script lang="ts">
    import { Form } from '$lib/elements/forms';
    import { disableCommands } from '$lib/commandCenter';
    import { beforeNavigate } from '$app/navigation';
    import { Alert, Layout, Modal } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let size: 's' | 'm' | 'l' = 'm';
    export let error: string = null;
    export let dismissible = true;
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

    $: $disableCommands(show);

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<Form isModal {onSubmit} bind:this={formComponent}>
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
