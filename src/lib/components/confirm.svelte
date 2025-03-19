<script lang="ts">
    import { Button, Form, InputCheckbox } from '$lib/elements/forms';
    import { Alert, Dialog, Layout } from '@appwrite.io/pink-svelte';

    export let open: boolean;
    export let title: string;
    export let error: string = null;
    export let action: string = 'Delete';
    export let canDelete: boolean = true;
    export let disabled: boolean = false;
    export let confirmDeletion: boolean = false;
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };

    let confirm = false;
    let checkboxId = `delete_${title.replaceAll(' ', '_').toLowerCase()}`;

    // reset checkbox status
    $: if (open && confirmDeletion) {
        confirm = false;
    }
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

        <Layout.Stack gap="l">
            <slot />

            {#if confirmDeletion}
                <InputCheckbox
                    size="s"
                    required
                    id={checkboxId}
                    bind:checked={confirm}
                    label="I understand and confirm" />
            {/if}
        </Layout.Stack>

        <svelte:fragment slot="footer">
            <Layout.Stack direction="row" gap="s" justifyContent="flex-end">
                <slot name="footer">
                    <Button text on:click={() => (open = false)}>Cancel</Button>
                    {#if canDelete}
                        <Button
                            danger
                            submit
                            disabled={disabled || (confirmDeletion ? !confirm : false)}
                            >{action}</Button>
                    {/if}
                </slot>
            </Layout.Stack>
        </svelte:fragment>
    </Dialog>
</Form>
