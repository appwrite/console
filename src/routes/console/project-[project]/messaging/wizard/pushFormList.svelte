<script context="module" lang="ts">
    export async function createPushMessage(params: PushMessageParams) {
        const response = await sdk.forProject.client.call(
            'POST',
            new URL(sdk.forProject.client.config.endpoint + '/messaging/messages/push'),
            {
                'X-Appwrite-Project': sdk.forProject.client.config.project,
                'content-type': 'application/json',
                'X-Appwrite-Mode': 'admin'
            },
            params
        );

        return response.json();
    }

    export function validateData(data: string[][]) {
        if (!data || data.length === 0) return;

        if (data.length === 1 && data[0][0] === '' && data[0][1] === '') return;

        const dataKeys = new Set<string>();
        for (let i = 0; i < data.length; i++) {
            if (data[i][0] === '') {
                return 'Keys cannot be empty';
            }
            if (data[i][1] === '') {
                return 'Values cannot be empty';
            }
            dataKeys.add(data[i][0]);
        }

        if (dataKeys.size !== data.length) {
            return 'Keys must be unique';
        }

        return '';
    }
</script>

<script lang="ts">
    import { messageParams, providerType, MessageStatuses, type PushMessageParams } from './store';
    import {
        Button,
        FormItem,
        FormItemPart,
        FormList,
        Helper,
        InputEmail,
        InputRadio,
        InputText,
        InputTextarea,
        Label
    } from '$lib/elements/forms';
    import { Pill } from '$lib/elements';
    import { CustomId, Modal } from '$lib/components';
    import { user } from '$lib/stores/user';
    import { clickOnEnter } from '$lib/helpers/a11y';
    import { ID } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import { ProviderTypes } from '../providerType.svelte';
    import PushPhone from '../pushPhone.svelte';
    import { onMount } from 'svelte';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';
    let otherEmail = '';
    let dataError = '';
    let customData: [string, string][] = [];

    onMount(() => {
        $messageParams[ProviderTypes.Push].data = customData || [['', '']];
    });

    async function sendTestMessage() {
        const email = selected === 'self' ? $user.email : otherEmail;
        console.log(email);

        createPushMessage({
            topics: $messageParams[ProviderTypes.Push]?.topics || [],
            targets: $messageParams[ProviderTypes.Push]?.targets || [],
            description: $messageParams[ProviderTypes.Push]?.description || 'Test push',
            status: MessageStatuses.PROCESSING,
            messageId: ID.unique(),
            // TODO: properly handle the test email address
            users: ['steven'],
            body: $messageParams[ProviderTypes.Push]?.body || '',
            title: $messageParams[ProviderTypes.Push]?.title || '',
            data: $messageParams[ProviderTypes.Push]?.data || []
        });
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
    $: customData = $messageParams[ProviderTypes.Push].data;
    $: dataError = validateData(customData || []);
</script>

<div class="u-flex u-gap-24">
    <FormList class="u-stretch">
        <InputText
            id="title"
            label="Title"
            placeholder="Enter title"
            bind:value={$messageParams[ProviderTypes.Push]['title']}>
        </InputText>
        <div class="u-colum-gap-2">
            <InputTextarea
                id="message"
                label="Message"
                placeholder="Type here..."
                bind:value={$messageParams[ProviderTypes.Push]['body']}>
            </InputTextarea>
            <!-- TODO: Add support for draft messages -->
            <!-- <div class="u-flex u-main-end">
                <Button text on:click={() => (showTest = true)}>Send test message</Button>
            </div> -->
            <Modal
                title="Send test message"
                bind:show={showTest}
                onSubmit={sendTestMessage}
                size="big">
                <slot />
                <InputRadio
                    label={$user.phone}
                    bind:group={selected}
                    value="self"
                    id="self"
                    name="selected" />
                <InputRadio
                    label="Other"
                    bind:group={selected}
                    value="other"
                    id="other"
                    name="selected"
                    fullWidth>
                    <svelte:fragment slot="description">
                        Enter the phone number to which the test message will be
                        <div
                            on:click={() => (selected = 'other')}
                            on:keyup|self={clickOnEnter}
                            role="button"
                            tabindex="0">
                            <InputEmail
                                showLabel={false}
                                id="email"
                                label="Email"
                                placeholder="Enter email"
                                bind:value={otherEmail} />
                        </div>
                    </svelte:fragment>
                </InputRadio>

                <svelte:fragment slot="footer">
                    <Button secondary on:click={() => (showTest = false)}>Cancel</Button>
                    <Button submit>Send</Button>
                </svelte:fragment>
            </Modal>
        </div>
        <form class="form">
            <Label>Custom data <span class="u-color-text-gray">(Optional)</span></Label>
            <div class=" u-grid u-gap-8">
                <ul class="form-list" style="--p-form-list-gap: 1rem">
                    {#each customData || [] as _, rowIndex}
                        <FormItem isMultiple>
                            <InputText
                                id={`${rowIndex}-key`}
                                isMultiple
                                fullWidth
                                bind:value={$messageParams[ProviderTypes.Push].data[rowIndex][0]}
                                placeholder="Enter key"
                                label="Key"
                                showLabel={false} />

                            <InputText
                                id={`${rowIndex}-value`}
                                isMultiple
                                fullWidth
                                bind:value={$messageParams[ProviderTypes.Push].data[rowIndex][1]}
                                placeholder="Enter value"
                                label="Value"
                                showLabel={false}
                                required />
                            <FormItemPart alignEnd>
                                <Button
                                    text
                                    on:click={() => {
                                        if (customData.length === 1) {
                                            $messageParams[ProviderTypes.Push].data = [['', '']];
                                            return;
                                        }

                                        $messageParams[ProviderTypes.Push].data = customData.filter(
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
                        $messageParams[ProviderTypes.Push].data = [...customData, ['', '']];
                    }}>
                    <span class="icon-plus" aria-hidden="true" />
                    <span class="text">Add data</span>
                </Button>
            </div>
        </form>
        <InputText
            id="description"
            label="Description"
            placeholder="Enter description"
            tooltip="Provide a summary of the message. Users won't see this description."
            bind:value={$messageParams[$providerType]['description']}>
        </InputText>
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Message ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId
                bind:show={showCustomId}
                name="Message"
                bind:id={$messageParams[$providerType].messageId}
                autofocus={false} />
        {/if}
    </FormList>
    <PushPhone
        title={$messageParams[$providerType]['title']}
        body={$messageParams[$providerType]['body']} />
</div>
