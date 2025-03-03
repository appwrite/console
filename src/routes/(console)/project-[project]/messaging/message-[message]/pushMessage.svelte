<script lang="ts">
    import { CardGrid } from '$lib/components';
    import {
        Button,
        Form,
        FormList,
        Helper,
        InputFilePicker,
        InputText,
        InputTextarea,
        Label
    } from '$lib/elements/forms';
    import type { Models } from '@appwrite.io/console';
    import PushPhone from '../pushPhone.svelte';
    import { onMount } from 'svelte';
    import { sdk } from '$lib/stores/sdk';
    import { invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { addNotification } from '$lib/stores/notifications';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { validateData } from '../wizard/pushFormList.svelte';
    import { Icon, Typography } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    /* eslint  @typescript-eslint/no-explicit-any: 'off' */
    export let message: Models.Message & { data: Record<string, any> };

    let title = '';
    let body = '';
    let file: Models.File = null;
    let originalCustomData: [string, string][] = [['', '']];
    let customData: [string, string][] = [['', '']];
    let dataError = '';
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

    $: dataError = validateData(customData || []);
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
    <CardGrid hideFooter={message.status != 'draft'}>
        <div class="grid-1-2-col-1 u-flex-vertical u-cross-start u-gap-16">
            <Typography.Title size="s">Message</Typography.Title>
            <div class="u-flex u-margin-block-start-24 u-width-full-line">
                <PushPhone {title} {body} />
            </div>
        </div>
        <svelte:fragment slot="aside">
            <FormList>
                <InputText
                    id="title"
                    label="Title"
                    disabled={message.status !== 'draft'}
                    bind:value={title} />
                <InputTextarea
                    id="message"
                    label="Message"
                    disabled={message.status !== 'draft'}
                    bind:value={body} />
                <InputFilePicker
                    disabled={message.status !== 'draft'}
                    bind:value={file}
                    label="Media"
                    optionalText="(Optional)" />
                <form class="form">
                    <Label
                        tooltip="A key/value payload of additional metadata that's hidden from users. Use this to include information to support logic such as redirection and routing."
                        >Custom data <span class="u-color-text-gray">(Optional)</span></Label>
                    <div class=" u-grid u-gap-8">
                        <ul class="form-list" style="--p-form-list-gap: 1rem">
                            {#each customData || [] as _, rowIndex}
                                <InputText
                                    id={`${rowIndex}-key`}
                                    disabled={message.status != 'draft'}
                                    bind:value={customData[rowIndex][0]}
                                    placeholder="Enter key"
                                    label="Key"
                                    showLabel={false} />
                                <InputText
                                    id={`${rowIndex}-value`}
                                    disabled={message.status != 'draft'}
                                    bind:value={customData[rowIndex][1]}
                                    placeholder="Enter value"
                                    label="Value"
                                    showLabel={false}
                                    required />
                                <Button
                                    text
                                    disabled={message.status != 'draft'}
                                    on:click={() => {
                                        if (customData.length === 1) {
                                            customData = [['', '']];
                                            return;
                                        }

                                        customData = customData.filter((_, i) => i !== rowIndex);
                                    }}>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            {/each}
                        </ul>
                        {#if dataError}
                            <Helper type="warning">{dataError}</Helper>
                        {/if}
                        <Button
                            text
                            disabled={customData && customData[customData.length - 1][0] === ''}
                            on:click={() => {
                                customData = [...customData, ['', '']];
                            }}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Add data
                        </Button>
                    </div>
                </form>
            </FormList>
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button {disabled} submit>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>
