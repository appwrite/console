<script lang="ts">
    import { FormList, InputTextarea } from '$lib/elements/forms';
    import { feedbackData } from '$lib/stores/feedback';
</script>

<FormList>
    <InputTextarea
        id="feedback"
        placeholder="Your message here"
        label="Message"
        required
        bind:value={$feedbackData.message} />
</FormList>
