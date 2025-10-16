<script lang="ts">
    import FakeModal from './fakeModal.svelte';
    import { Alert, Layout } from '@appwrite.io/pink-svelte';

    export let show = false;
    export let error: string = null;
    export let dismissible = true;
    export let size: 's' | 'm' | 'l' = 'm';
    export let onSubmit: (e: SubmitEvent) => Promise<void> | void = function () {
        return;
    };
    export let title = '';
    export let hideFooter = false;

    let alert: HTMLElement;

    $: if (error) {
        alert?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
    }
</script>

<FakeModal
    bind:show
    title={title}
    onSubmit={onSubmit}
    closable={dismissible}
    size={(size === 's' ? 'small' : 'big') as 'small' | 'big'}>
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
        {#if !hideFooter}
            <Layout.Stack direction="row" justifyContent="flex-end">
                <slot name="footer" />
            </Layout.Stack>
        {/if}
    </svelte:fragment>
</FakeModal>

<style>
    /* Make backdrop non-blocking while keeping dialog interactive */
    :global(.payment-modal-backdrop) {
        pointer-events: none;
    }
    :global(.payment-modal-backdrop .modal) {
        pointer-events: auto;
    }
</style>


