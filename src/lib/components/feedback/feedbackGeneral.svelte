<script lang="ts">
    import { onMount } from 'svelte';
    import { InputTextarea } from '$lib/elements/forms';
    import { feedbackData } from '$lib/stores/feedback';

    onMount(() => {
        setTimeout(() => {
            const textarea = document.getElementById('feedback') as HTMLTextAreaElement;
            if (textarea) {
                textarea.focus();
            }
        }, 150);
    });
</script>

<InputTextarea
    required
    id="feedback"
    autofocus={true}
    bind:value={$feedbackData.message}
    label="Tell us more about your experience"
    placeholder="Share your suggestions and feature requests..." />
