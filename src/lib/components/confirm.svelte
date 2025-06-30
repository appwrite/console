<script lang="ts">
    import { Button, InputCheckbox } from '$lib/elements/forms';
    import { Layout } from '@appwrite.io/pink-svelte';
    import { Modal } from '.';
    export let open: boolean;
    export let title: string;
    export let error: string = null;
    export let action: string = 'Delete';
    export let disabled: boolean = false;
    export let submissionLoader = false;
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

<Modal size="s" bind:show={open} {title} {onSubmit} bind:error>
    <svelte:fragment slot="description">
        {#if confirmDeletion}
            This action is irreversible. Please confirm to proceed.
        {/if}
    </svelte:fragment>

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
        <Button text on:click={() => (open = false)}>Cancel</Button>
        <Button
            danger
            submit
            {submissionLoader}
            disabled={disabled || (confirmDeletion ? !confirm : false)}>
            {action}
        </Button>
    </svelte:fragment>
</Modal>
