<script lang="ts">
    import { CardGrid, Heading } from '$lib/components';
    import {
        Button,
        Form,
        FormItem,
        FormItemPart,
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
    import { page } from '$app/stores';

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
            file = await sdk
                .forProject($page.params.region, $page.params.project)
                .storage.getFile(message.data.image?.bucketId, message.data.image?.fileId);
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
            await sdk
                .forProject($page.params.region, $page.params.project)
                .messaging.updatePush(
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
            <Heading tag="h6" size="7">Message</Heading>
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
                <FormItem>
                    <InputFilePicker
                        disabled={message.status !== 'draft'}
                        bind:value={file}
                        label="Media"
                        optionalText="(Optional)" />
                </FormItem>
                <form class="form">
                    <FormItem>
                        <Label
                            tooltip="A key/value payload of additional metadata that's hidden from users. Use this to include information to support logic such as redirection and routing."
                            >Custom data <span class="u-color-text-gray">(Optional)</span></Label>
                    </FormItem>
                    <div class=" u-grid u-gap-8">
                        <ul class="form-list" style="--p-form-list-gap: 1rem">
                            {#each customData || [] as _, rowIndex}
                                <FormItem isMultiple>
                                    <InputText
                                        id={`${rowIndex}-key`}
                                        isMultiple
                                        fullWidth
                                        disabled={message.status != 'draft'}
                                        bind:value={customData[rowIndex][0]}
                                        placeholder="Enter key"
                                        label="Key"
                                        showLabel={false} />
                                    <InputText
                                        id={`${rowIndex}-value`}
                                        isMultiple
                                        fullWidth
                                        disabled={message.status != 'draft'}
                                        bind:value={customData[rowIndex][1]}
                                        placeholder="Enter value"
                                        label="Value"
                                        showLabel={false}
                                        required />
                                    <FormItemPart alignEnd>
                                        <Button
                                            text
                                            disabled={message.status != 'draft'}
                                            on:click={() => {
                                                if (customData.length === 1) {
                                                    customData = [['', '']];
                                                    return;
                                                }

                                                customData = customData.filter(
                                                    (_, i) => i !== rowIndex
                                                );
                                            }}>
                                            <span class="icon-x" aria-hidden="true" />
                                        </Button>
                                    </FormItemPart>
                                </FormItem>
                            {/each}
                        </ul>
                        {#if dataError}
                            <Helper type="warning">{dataError}</Helper>
                        {/if}
                        <Button
                            noMargin
                            text
                            disabled={customData && customData[customData.length - 1][0] === ''}
                            on:click={() => {
                                customData = [...customData, ['', '']];
                            }}>
                            <span class="icon-plus" aria-hidden="true" />
                            <span class="text">Add data</span>
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
