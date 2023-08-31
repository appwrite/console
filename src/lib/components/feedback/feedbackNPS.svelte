<script lang="ts">
    import { FormList, InputTextarea, InputText, InputEmail } from '$lib/elements/forms';
    import { feedbackData } from '$lib/stores/feedback';
    import Evaluation from './evaluation.svelte';

    $: console.log($feedbackData);
</script>

<Evaluation bind:value={$feedbackData.value}>
    How likely are you to recommend Appwrite to a friend or colleague?
</Evaluation>
{#if $feedbackData.value}
    <FormList>
        <InputTextarea
            id="feedback"
            placeholder="Your message here"
            label="Message"
            required
            bind:value={$feedbackData.message}
            showLabel={false} />
        <InputText
            label="Name"
            id="name"
            bind:value={$feedbackData.name}
            placeholder="Enter name" />
        <InputEmail
            label="Email"
            id="email"
            bind:value={$feedbackData.email}
            placeholder="Enter email" />
    </FormList>
{/if}
