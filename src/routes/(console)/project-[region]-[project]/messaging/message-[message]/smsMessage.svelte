<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import SMSPhone from '../smsPhone.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { trackEvent, Submit, trackError } from '$lib/actions/analytics';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Typography } from '@appwrite.io/pink-svelte';
    import { page } from '$app/state';

    export let message: Models.Message & { data: Record<string, string> };

    let content = '';
    let disabled = true;

    onMount(() => {
        content = message.data.content;
    });

    async function update() {
        try {
            await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.updateSms(message.$id, undefined, undefined, undefined, content);
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

    $: disabled = content === message.data.content;
</script>

<Form onSubmit={update}>
    <CardGrid hideFooter={message.status != 'draft'}>
        <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
            <Typography.Title size="s">Message</Typography.Title>
            <SMSPhone {content} />
        </div>
        <svelte:fragment slot="aside">
            <InputTextarea
                id="message"
                label="Message"
                disabled={message.status != 'draft'}
                bind:value={content}></InputTextarea>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
