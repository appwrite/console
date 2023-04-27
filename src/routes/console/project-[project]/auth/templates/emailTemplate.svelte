<script lang="ts">
    import {
        Button,
        Form,
        FormList,
        InputEmail,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { project } from '../../store';
    import { saveEmailTemplate } from './+page.svelte';
    import { emailTemplate } from './strote';

    let openVariablesDescription = false;
    let openResetModal = false;

    function submit() {
        saveEmailTemplate($project.$id, $emailTemplate);
    }
</script>

<Form onSubmit={submit}>
    <FormList>
        <InputText
            id="senderName"
            label="Sender Name"
            bind:value={$emailTemplate.senderName}
            placeholder={'{{project}}'} />
        <InputEmail
            bind:value={$emailTemplate.senderEmail}
            id="senderEmail"
            label="Sender Email"
            placeholder="Enter sender email" />
        <InputEmail id="replyTo" label="Reply to" placeholder="DoNotReply" />

        <li>
            <p class="text">
                Click to copy the variables you can use in the fields below. For more information,
                <button class="link" on:click={() => (openVariablesDescription = true)}>
                    click here
                </button>.
            </p>
        </li>
        <InputText
            bind:value={$emailTemplate.subject}
            id="subject"
            label="Subject"
            placeholder="Enter subject" />
        <InputTextarea
            bind:value={$emailTemplate.message}
            id="message"
            label="Message"
            placeholder="Enter your message"
            readonly={!$project.smtpEnabled} />
        <div class="u-flex u-gap-32 u-main-end">
            <Button on:click={() => (openResetModal = true)} text>Reset changes</Button>
            <Button submit>Update</Button>
        </div>
    </FormList>
</Form>
