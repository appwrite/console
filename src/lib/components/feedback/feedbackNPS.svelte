<script lang="ts">
    import Evaluation from './evaluation.svelte';
    import { feedbackData } from '$lib/stores/feedback';
    import { InputTextarea } from '$lib/elements/forms';
</script>

<Evaluation bind:value={$feedbackData.value} />
{#if $feedbackData.value !== null}
    <!-- TODO: @itznotabug, helper is a plain string atm, cannot add html/anchor for Discord link -->
    <InputTextarea
        id="feedback"
        bind:value={$feedbackData.message}
        label="Tell us more about your experience (optional)"
        placeholder="Share your suggestions and feature requests..."
        helper="Need help? Join our Discord for community support" />
{/if}
