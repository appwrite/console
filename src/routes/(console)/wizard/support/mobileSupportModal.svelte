<script lang="ts">
    import { Support } from '$lib/components';
    import Modal from '$lib/components/modal.svelte';

    export let show: boolean;
</script>

<div class="mobile-support-dialog-modal">
    <Modal title="Support" headerDivider={false} size="small" bind:show>
        <div class="inner-modal-wrapper">
            <Support showHeader={false} />
        </div>
    </Modal>
</div>

<style>
    :global(.mobile-support-dialog-modal dialog) {
        background-color: #fff;
    }

    :global(.theme-dark .mobile-support-dialog-modal dialog) {
        background-color: #131315;
    }

    .inner-modal-wrapper {
        padding-block-start: 0.5rem;
    }
</style>
