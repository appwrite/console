<script lang="ts">
    import { Box } from '$lib/components';
    import {
        Button,
        Form,
        FormList,
        InputEmail,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { afterUpdate } from 'svelte';
    import LocaleOptions from './localeOptions.svelte';
    export let onSubmit: (data: any) => Promise<void> | void;

    export let template: any = undefined;
    let senderName: string;
    let senderEmail: string;
    let message: string;
    let subject: string;
    let locale: string;

    afterUpdate(() => {
        senderName = template?.senderName;
        senderEmail = template?.senderEmail;
        message = template?.message;
        subject = template?.subject;
        locale = template?.locale;
    });
    function submit() {
        if (onSubmit) {
            onSubmit({ senderName, senderEmail, message, subject, locale });
        }
    }
</script>

<Box>
    <Form onSubmit={submit}>
        <FormList>
            <LocaleOptions />
            <InputText
                id="senderName"
                label="Sender Name"
                bind:value={senderName}
                placeholder={'{{project}}'} />
            <InputEmail
                bind:value={senderEmail}
                id="senderEmail"
                label="Sender Email"
                placeholder="" />
            <InputEmail id="replyTo" label="Reply to" placeholder="DoNotReply" />
            <InputText bind:value={subject} id="subject" label="Subject" />
            <InputTextarea bind:value={message} id="message" label="Message" />
            <Button submit>Update</Button>
        </FormList>
    </Form>
</Box>
