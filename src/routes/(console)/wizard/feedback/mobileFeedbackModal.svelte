<script lang="ts">
    import Modal from '$lib/components/modal.svelte';
    import { isSidebarOpen } from '$lib/stores/sidebar';
    import { Feedback } from '$lib/components/feedback';
    import { feedback } from '$lib/stores/feedback';

    $: if ($feedback.show) {
        $isSidebarOpen = false;
    }
</script>

<div class="mobile-feedback-dialog-modal">
    <Modal title="Feedback" bind:show={$feedback.show} dismissible={false}>
        <Feedback isMobile />
    </Modal>
</div>

<style>
    :global(.mobile-feedback-dialog-modal dialog) {
        background-color: #fff;
    }

    :global(.theme-dark .mobile-feedback-dialog-modal dialog) {
        background-color: #131315;
    }

    /* pink2 modal doesn't allow removing the header divider yet, temporary fix*/
    :global(.mobile-feedback-dialog-modal dialog header) {
        border-bottom: unset !important;
        padding-bottom: unset !important;
    }

    /* pink2 modal doesn't remove footer if not used, temporary fix*/
    :global(.mobile-feedback-dialog-modal dialog footer) {
        display: none !important;
    }
</style>
