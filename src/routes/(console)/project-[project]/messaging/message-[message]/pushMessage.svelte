<script lang="ts">
    import { CardGrid } from '$lib/components';
    import { Button, Form, InputFilePicker, InputText, InputTextarea } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import PushPhone from '../pushPhone.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { Icon, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    export let message: Models.Message & { data: Record<string, any> };

    let title = '';
    let body = '';
    let file: Models.File = null;
    let originalCustomData: [string, string][] = [['', '']];
    let customData: [string, string][] = [['', '']];
    let disabled = true;

    onMount(async () => {
        title = message.data.title;
        body = message.data.body;
        if (message.data?.image) {
            file = await sdk.forProject.storage.getFile(
                message.data.image?.bucketId,
                message.data.image?.fileId
            );
        }

        const dataEntries: [string, string][] = [];
        Object.entries(message.data['data'] ?? {}).forEach(([key, value]) => {
            dataEntries.push([key, value.toString()]);
        });
        customData = dataEntries.length ? dataEntries : [['', '']];
        originalCustomData = structuredClone(customData);
    });

    async function update() {
        try {
            const fileCompoundId = file ? `${file.bucketId}:${file.$id}` : undefined;
            const data = customData.reduce((acc, [key, value]) => {
                if (key) {
                    acc[key] = value;
                }
                return acc;
            }, {});
            await sdk.forProject.messaging.updatePush(
                message.$id,
                undefined,
                undefined,
                undefined,
                title,
                body,
                data,
                undefined,
                fileCompoundId
            );
            originalCustomData = structuredClone(customData);
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
        title === message.data.title &&
        body === message.data.body &&
        file?.$id === message.data.image?.fileId &&
        file?.bucketId === message.data.image?.bucketId &&
        originalCustomData.length === customData.length &&
        originalCustomData.every(
            (ocd, i) =>
                ocd.length === customData[i].length && ocd.every((v, j) => v === customData[i][j])
        );
</script>

<Form onSubmit={update}>
    <CardGrid hideFooter={message.status !== 'draft'}>
        <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
            <Typography.Title size="s">Message</Typography.Title>
            <div class="u-flex u-margin-block-start-24 u-width-full-line">
                <PushPhone {title} {body} />
            </div>
        </div>
        <svelte:fragment slot="aside">
            <InputText
                required
                id="title"
                label="Title"
                disabled={message.status !== 'draft'}
                bind:value={title} />
            <InputTextarea
                required
                id="message"
                label="Message"
                disabled={message.status !== 'draft'}
                bind:value={body} />
            <InputFilePicker
                disabled={message.status !== 'draft'}
                bind:value={file}
                label="Media"
                optionalText="(Optional)" />
            <Layout.Stack gap="s">
                {#each customData || [] as [key, value], index}
                    <Layout.Stack direction="row" alignItems="flex-end">
                        <InputText
                            id={`key-${index}`}
                            bind:value={key}
                            placeholder="Enter key"
                            label={index === 0 ? 'Key' : undefined} />
                        <Layout.Stack direction="row" alignItems="flex-end" gap="xs">
                            <InputText
                                id={`value-${index}`}
                                bind:value
                                placeholder="Enter value"
                                label={index === 0 ? 'Value' : undefined} />
                            <Button
                                icon
                                compact
                                disabled={(!key || !value) && index === 0}
                                on:click={() => {
                                    if (customData.length === 1) {
                                        customData = [['', '']];
                                        return;
                                    }
                                    customData = customData.filter((_, i) => i !== index);
                                }}>
                                <span class="icon-x" aria-hidden="true"></span>
                            </Button>
                        </Layout.Stack>
                    </Layout.Stack>
                {/each}
                <div>
                    <Button
                        compact
                        disabled={customData.length > 0 &&
                            customData[customData.length - 1][0] === ''}
                        on:click={() => (customData = [...customData, ['', '']])}>
                        <Icon icon={IconPlus} slot="start" size="s" />
                        Add data
                    </Button>
                </div>
            </Layout.Stack>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
