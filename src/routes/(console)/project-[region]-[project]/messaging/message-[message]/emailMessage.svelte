<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { CardGrid, Heading } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import {
        Button,
        Form,
        FormList,
        InputSwitch,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { addNotification } from '$lib/stores/notifications';
    import { sdk } from '$lib/stores/sdk';
    import type { Models } from '@appwrite.io/console';
    import { onMount } from 'svelte';
    import { page } from '$app/stores';

    export let message: Models.Message & { data: Record<string, string> };

    let subject = '';
    let content = '';
    let html = false;
    let disabled = true;

    onMount(() => {
        subject = message.data.subject;
        content = message.data.content;
        html = (message.data['html'] ?? false) as boolean;
    });

    async function update() {
        try {
            await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.updateEmail(
                    message.$id,
                    undefined,
                    undefined,
                    undefined,
                    subject,
                    content,
                    undefined,
                    html
                );
            await invalidate(Dependencies.MESSAGING_MESSAGE);
            addNotification({
                message: 'Message has been updated',
                type: 'success'
            });
            trackEvent(Submit.MessagingMessageUpdate);
        } catch (error) {
            addNotification({
                message: error.message,
                type: 'error'
            });
            trackError(error, Submit.MessagingMessageUpdate);
        }
    }

    $: disabled =
        subject === message.data.subject &&
        content === message.data.content &&
        html === ((message.data['html'] ?? false) as boolean);

    $: isDraft = message.status === 'draft';
</script>

<Form onSubmit={update}>
    <CardGrid hideFooter={!isDraft}>
        <div class="grid-1-2-col-1 u-flex u-cross-center u-gap-16">
            <Heading tag="h6" size="7">Message</Heading>
        </div>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText id="subject" label="Subject" disabled={!isDraft} bind:value={subject}
                ></InputText>
                <InputTextarea id="message" label="Message" disabled={!isDraft} bind:value={content}
                ></InputTextarea>
                <InputSwitch label="HTML mode" id="html" bind:value={html}>
                    <svelte:fragment slot="description">
                        Enable the HTML mode if your message contains HTML tags.
                    </svelte:fragment>
                </InputSwitch>
            </FormList>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
