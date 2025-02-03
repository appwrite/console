<script lang="ts">
    import { Support } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';
    import { isSidebarOpen } from '$lib/stores/sidebar';

    export let show: boolean;

    $: if (show) {
        $isSidebarOpen = false;
    }
</script>

<div class="mobile-support-dialog-modal">
    <Modal title="Support" bind:show>
        <Support showHeader={false} />
    </Modal>
</div>

<style>
    :global(.mobile-support-dialog-modal dialog) {
        background-color: #fff;
    }

    :global(.theme-dark .mobile-support-dialog-modal dialog) {
        background-color: #131315;
    }

    /* pink2 modal doesn't allow removing the header divider yet, temporary fix*/
    :global(.mobile-support-dialog-modal dialog header) {
        border-bottom: unset !important;
        padding-bottom: unset !important;
    }

    /* pink2 modal doesn't remove footer if not used, temporary fix*/
    :global(.mobile-support-dialog-modal dialog footer) {
        display: none !important;
    }
</style>
