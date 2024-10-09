<script lang="ts">
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { feedbackData } from '$lib/stores/feedback';
    import Evaluation from './evaluation.svelte';
</script>

<FormList>
    <Evaluation bind:value={$feedbackData.value}>
        How likely are you to recommend Appwrite to a friend or colleague?
    </Evaluation>
    {#if $feedbackData.value !== null}
        <InputTextarea
            id="feedback"
            placeholder="Your message here"
            label="Message"
            required
            bind:value={$feedbackData.message}
            showLabel={false} />
    {/if}
</FormList>
