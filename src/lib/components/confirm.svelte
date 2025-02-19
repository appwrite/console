<script lang="ts">
    import { Button, Form } from '$lib/elements/forms';
    import { Alert, Dialog, Layout } from '@appwrite.io/pink-svelte';

    export let open: boolean;
    export let title: string;
    export let error: string = null;
    export let action: string = 'Delete';
    export let canDelete: boolean = true;
    export let disabled: boolean = false;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
</script>

<Form isModal {onSubmit}>
    <Dialog {title} bind:open>
        {#if error}
            <Alert.Inline
                dismissible
                status="error"
                on:dismiss={() => {
                    error = null;
                }}>
                {error}
            </Alert.Inline>
        {/if}
        <slot />
        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
                <slot name="footer">
                    <Button text on:click={() => (open = false)}>Cancel</Button>
                    {#if canDelete}
                        <Button danger submit {disabled}>{action}</Button>
                    {/if}
                </slot>
            </Layout.Stack>
        </svelte:fragment>
    </Dialog>
</Form>
