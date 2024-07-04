<script lang="ts">
    import { trackEvent } from '$lib/actions/analytics';
    import WizardExitModal from './wizardExitModal.svelte';

    export let showExitModal = false;
    export let href = '';
</script>

<section class="wizard-secondary c-wizard-position">
    <div class="wizard-secondary-container">
        <slot />
    </div>
</section>

{#if showExitModal}
    <WizardExitModal
        {href}
        bind:show={showExitModal}
        on:exit={() => {
            trackEvent('wizard_exit', {
                from: 'prompt'
            });
        }}>
        <slot name="exit">
            Are you sure you want to exit from this process? All data will be deleted. This action
            is irreversible.
        </slot>
    </WizardExitModal>
{/if}

<style lang="scss">
    .c-wizard-position {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 30;
        width: 100%;
        height: 100%;
        max-height: 100vh;
        overflow-y: auto;
    }
</style>
