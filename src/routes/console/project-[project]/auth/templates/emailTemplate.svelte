<script lang="ts">
    import {
        Button,
        Form,
        FormList,
        InputEmail,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    export let onSubmit: (data: any) => Promise<void> | void;

    export let senderName: string;
    export let senderEmail: string;
    export let message: string;
    export let subject: string;

    function submit() {
        if (onSubmit) {
            onSubmit({ senderName, senderEmail, message, subject });
        }
    }
</script>

<Form onSubmit={submit}>
    <FormList>
        <InputText
            id="senderName"
            label="Sender Name"
            bind:value={senderName}
            placeholder={'{{project}}'} />
        <InputEmail bind:value={senderEmail} id="senderEmail" label="Sender Email" placeholder="" />
        <InputEmail id="replyTo" label="Reply to" placeholder="DoNotReply" />
        <InputText bind:value={subject} id="subject" label="Subject" />
        <InputTextarea bind:value={message} id="message" label="Message" />
        <Button submit>Update</Button>
    </FormList>
</Form>
