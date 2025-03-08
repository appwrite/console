<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Icon, Layout, Tag, Typography } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable, type Writable } from 'svelte/store';
    import { ID, MessagingProviderType, type Models } from '@appwrite.io/console';
    import PushPhone from '../../pushPhone.svelte';
    import CustomId from '$lib/components/customId.svelte';
    import { IconPencil, IconPlus } from '@appwrite.io/pink-icons-svelte';
    import InputText from '$lib/elements/forms/inputText.svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import InputFilePicker from '$lib/elements/forms/inputFilePicker.svelte';
    import Targets from './(components)/targets.svelte';
    import Schedule from './(components)/schedule.svelte';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let showCustomId = false;

    let docsUrl = 'https://appwrite.io/docs/products/messaging';

    switch ($page.params.type) {
        case MessagingProviderType.Email:
            docsUrl += '/send-email-messages';
            break;
        case MessagingProviderType.Sms:
            docsUrl += '/send-sms-messages';
            break;
        case MessagingProviderType.Push:
            docsUrl += '/send-push-notifications';
            break;
    }

    let id: string;
    let file: Models.File;
    let data: Writable<[string, string][]> = writable([]);
    let title: string;
    let body: string;
    let topics: string[];
    let users: string[];
    let targets: string[];
    let draft: boolean;
    let scheduledAt: string;

    async function create() {
        try {
            const messageId = id || ID.unique();
            const fileCompoundId = file ? `${file.bucketId}:${file.$id}` : undefined;
            const customData: Record<string, string> = {};
            for (const item of $data) {
                if (item[0] === '') continue;
                customData[item[0]] = item[1];
            }

            const response = await sdk.forProject.messaging.createPush(
                messageId,
                title,
                body,
                topics,
                users,
                targets,
                customData,
                undefined,
                fileCompoundId,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                draft,
                scheduledAt
            );
            let message = '';
            switch (response.status) {
                case 'draft':
                    message = 'The message has been saved as draft.';
                    break;
                case 'processing':
                    message = 'The message is queued for processing.';
                    break;
                case 'scheduled':
                    message = 'The message has been scheduled.';
                    break;
            }
            addNotification({
                type: 'success',
                message
            });
            trackEvent(Submit.MessagingMessageCreate, {
                providerType: 'push',
                status: response.status
            });
            await goto(`${base}/project-${$page.params.project}/messaging/message-${response.$id}`);
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.MessagingMessageCreate);
        }
    }

    function saveAsDraft() {
        draft = true;
        formComponent.triggerSubmit();
    }
</script>

<Wizard
    title="Create push message"
    href={`${base}/project-${$page.params.project}/messaging/`}
    bind:showExitModal
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Message">
                <Layout.Stack>
                    <InputText
                        id="title"
                        label="Title"
                        required
                        placeholder="Enter title"
                        bind:value={title}>
                    </InputText>
                    {#if !showCustomId}
                        <div>
                            <Tag size="s" on:click={() => (showCustomId = !showCustomId)}
                                ><Icon icon={IconPencil} /> Message ID</Tag>
                        </div>
                    {:else}
                        <CustomId autofocus bind:show={showCustomId} name="Message" bind:id />
                    {/if}
                    <InputTextarea
                        id="message"
                        label="Message"
                        placeholder="Type here..."
                        required
                        maxlength={1000}
                        bind:value={body}>
                    </InputTextarea>
                    <InputFilePicker bind:value={file} label="Media" />
                </Layout.Stack>
            </Fieldset>
            <Fieldset legend="Custom data">
                <Layout.Stack>
                    <Typography.Text>
                        A key/value payload of additional metadata that's hidden from users. Use
                        this to include information to support logic such as redirection and
                        routing.
                    </Typography.Text>
                    {#each $data as [key, value], index}
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
                                        if (index === 0 && $data?.length === 1) {
                                            $data = [['', '']];
                                        } else {
                                            $data.splice(index, 1);
                                            $data = $data;
                                        }
                                    }}>
                                    <span class="icon-x" aria-hidden="true" />
                                </Button>
                            </Layout.Stack>
                        </Layout.Stack>
                    {/each}
                    <div>
                        <Button
                            secondary
                            disabled={$data.length > 0 && $data[$data.length - 1][0] === ''}
                            on:click={() => ($data = [...$data, ['', '']])}>
                            <Icon icon={IconPlus} slot="start" size="s" />
                            Add data
                        </Button>
                    </div>
                </Layout.Stack>
            </Fieldset>
            <Fieldset legend="Targets">
                <Targets type={MessagingProviderType.Push} bind:topics bind:targets />
            </Fieldset>
            <Fieldset legend="Schedule">
                <Schedule type={MessagingProviderType.Push} bind:scheduledAt {topics} {targets} />
            </Fieldset>
        </Layout.Stack>
    </Form>
    <PushPhone {title} {body} slot="aside" />
    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button fullWidthMobile secondary on:click={saveAsDraft}>Save as draft</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
