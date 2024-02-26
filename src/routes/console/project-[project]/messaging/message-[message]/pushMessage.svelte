<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import { Button, Form, FormList, InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import PushPhone from '../pushPhone.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';

    export let message: Models.Message & { data: Record<string, string> };

    let title = '';
    let body = '';
    let disabled = true;

    onMount(() => {
        title = message.data.title;
        body = message.data.body;
    });

    async function update() {
        try {
            await sdk.forProject.messaging.updatePush(
                message.$id,
                undefined,
                undefined,
                undefined,
                title,
                body
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

    $: disabled = title === message.data.title && body === message.data.body;
</script>

<Form onSubmit={update}>
    <CardGrid>
        <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
            <Heading tag="h6" size="7">Message</Heading>
            <div class="u-flex u-margin-block-start-24 u-width-full-line">
                <PushPhone {title} {body} />
            </div>
        </div>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText id="title" label="Title" bind:value={title}></InputText>
                <InputTextarea id="message" label="Message" bind:value={body}></InputTextarea>
                <div class="u-flex u-main-end"></div>
            </FormList>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
