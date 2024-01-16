<script lang="ts">
    import { WizardStep } from '$lib/layout';
    import { app } from '$lib/stores/app';
    import imgDark from '$lib/images/feedback/feedback-dark.svg';
    import imgLight from '$lib/images/feedback/feedback-light.svg';
</script>

<WizardStep>
    <svelte:fragment slot="title">Thanks for the feedback!</svelte:fragment>

    <div class="u-flex u-main-center">
        {#if $app.themeInUse === 'dark'}
            <img src={imgDark} alt="" class="u-only-dark" />
        {:else}
            <img src={imgLight} alt="" class="u-only-light" />
        {/if}
    </div>
</WizardStep>
