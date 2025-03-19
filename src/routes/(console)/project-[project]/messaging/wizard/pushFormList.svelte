<script context="module" lang="ts">
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
    import { messageParams, providerType } from './store';
    import {
        Button,
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
    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import { sdk } from '$lib/stores/sdk';
    import PushPhone from '../pushPhone.svelte';
    import { onMount } from 'svelte';
    import InputFilePicker from '$lib/elements/forms/inputFilePicker.svelte';
    import { Icon } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';

    let showCustomId = false;
    let showTest = false;
    let selected = 'self';
    let otherEmail = '';
    let dataError = '';
    let customData: [string, string][] = [];

    onMount(() => {
        customData = $messageParams[MessagingProviderType.Push].data;
    });

    async function sendTestMessage() {
        const email = selected === 'self' ? $user.email : otherEmail;
        console.log(email);

        // TODO: replace with test method
        sdk.forProject.messaging.createPush(
            ID.unique(),
            $messageParams[MessagingProviderType.Push]?.title || undefined,
            $messageParams[MessagingProviderType.Push]?.body || undefined,
            $messageParams[MessagingProviderType.Push]?.topics || [],
            $messageParams[MessagingProviderType.Push]?.users || [],
            $messageParams[MessagingProviderType.Push]?.targets || [],
            $messageParams[MessagingProviderType.Push]?.data || undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined
        );
    }

    $: otherEmail = selected === 'self' ? '' : otherEmail;
    $: customData = $messageParams[MessagingProviderType.Push].data;
    $: dataError = validateData(customData || []);
</script>

<div class="u-flex u-gap-24">
    <FormList>
        <InputText
            id="title"
            label="Title"
            required
            placeholder="Enter title"
            bind:value={$messageParams[MessagingProviderType.Push]['title']}>
        </InputText>
        <div class="u-colum-gap-2">
            <InputTextarea
                id="message"
                label="Message"
                placeholder="Type here..."
                required
                maxlength={1000}
                bind:value={$messageParams[MessagingProviderType.Push]['body']}>
            </InputTextarea>
            <!-- TODO: Add support for draft messages -->
            <!-- <div class="u-flex u-main-end">
                <Button text on:click={() => (showTest = true)}>Send test message</Button>
            </div> -->
            <Modal
                title="Send test message"
                bind:show={showTest}
                onSubmit={sendTestMessage}
                size="l">
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
                    name="selected">
                    <svelte:fragment slot="description">
                        Enter the phone number to which the test message will be
                        <div
                            on:click={() => (selected = 'other')}
                            on:keyup|self={clickOnEnter}
                            role="button"
                            tabindex="0">
                            <InputEmail
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
            <FormList>
                <InputFilePicker
                    bind:value={$messageParams[MessagingProviderType.Push].file}
                    label="Media" />
                <Label
                    tooltip="A key/value payload of additional metadata that's hidden from users. Use this to include information to support logic such as redirection and routing."
                    >Custom data <span class="u-color-text-gray">(Optional)</span></Label>
            </FormList>

            <div class=" u-grid u-gap-8">
                <ul class="form-list" style="--p-form-list-gap: 1rem">
                    {#each customData || [] as _, rowIndex}
                        <InputText
                            id={`${rowIndex}-key`}
                            bind:value={
                                $messageParams[MessagingProviderType.Push].data[rowIndex][0]
                            }
                            placeholder="Enter key"
                            label="Key" />

                        <InputText
                            id={`${rowIndex}-value`}
                            bind:value={
                                $messageParams[MessagingProviderType.Push].data[rowIndex][1]
                            }
                            placeholder="Enter value"
                            label="Value"
                            required />
                        <Button
                            text
                            on:click={() => {
                                if (customData.length === 1) {
                                    $messageParams[MessagingProviderType.Push].data = [['', '']];
                                    return;
                                }

                                $messageParams[MessagingProviderType.Push].data = customData.filter(
                                    (_, i) => i !== rowIndex
                                );
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
                        $messageParams[MessagingProviderType.Push].data = [...customData, ['', '']];
                    }}>
                    <Icon icon={IconPlus} slot="start" size="s" />
                    Add data
                </Button>
            </div>
        </form>
        {#if !showCustomId}
            <div>
                <Pill button on:click={() => (showCustomId = !showCustomId)}
                    ><span class="icon-pencil" aria-hidden="true" /><span class="text">
                        Message ID
                    </span></Pill>
            </div>
        {:else}
            <CustomId
                autofocus
                bind:show={showCustomId}
                name="Message"
                bind:id={$messageParams[$providerType].messageId}
                fullWidth />
        {/if}
    </FormList>
    <PushPhone
        title={$messageParams[$providerType]['title']}
        body={$messageParams[$providerType]['body']}
        classes="is-only-desktop" />
</div>
<div class="u-flex u-main-center u-margin-block-start-24">
    <PushPhone
        title={$messageParams[$providerType]['title']}
        body={$messageParams[$providerType]['body']}
        classes="is-not-desktop" />
</div>
