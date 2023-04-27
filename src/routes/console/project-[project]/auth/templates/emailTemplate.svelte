<script lang="ts">
    import {
        Button,
        Form,
        FormList,
        InputEmail,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import EditMessage from './editMessage.svelte';
    export let onSubmit: (data: any) => Promise<void> | void;

    export let senderName: string;
    export let senderEmail: string;
    export let message: string;
    export let subject: string;

    let showEdit = false;

    function submit() {
        if (onSubmit) {
            onSubmit({ senderName, senderEmail, message, subject });
        }
    }

    function reset() {
        console.log('reset form');
    }
</script>

<Form onSubmit={submit}>
    <FormList>
        <InputText
            id="senderName"
            label="Sender Name"
            bind:value={senderName}
            placeholder={'{{project}}'} />
        <InputEmail
            bind:value={senderEmail}
            id="senderEmail"
            label="Sender Email"
            placeholder="Enter sender email" />
        <InputEmail id="replyTo" label="Reply to" placeholder="DoNotReply" />
        <InputText bind:value={subject} id="subject" label="Subject" placeholder="Enter subject" />
        <InputTextarea
            bind:value={message}
            id="message"
            label="Message"
            placeholder="Enter your message"
            readonly
            on:click={() => (showEdit = true)} />
    </FormList>
    <div class="u-flex">
        <Button on:click={reset} text>Reset changes</Button>
        <Button submit>Update</Button>
    </div>
</Form>

<EditMessage {message} bind:show={showEdit} />
