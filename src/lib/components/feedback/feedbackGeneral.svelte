<script lang="ts">
    import { FormList, InputTextarea, InputText, InputEmail } from '$lib/elements/forms';
    import { feedbackData } from '$lib/stores/feedback';
</script>

<FormList>
    <InputText label="Name" id="name" bind:value={$feedbackData.name} placeholder="Enter name" />
    <InputEmail
        label="Email"
        id="email"
        bind:value={$feedbackData.email}
        placeholder="Enter email" />
    <InputTextarea
        id="feedback"
        placeholder="Your message here"
        label="Message"
        required
        bind:value={$feedbackData.message} />
</FormList>
