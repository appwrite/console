<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Icon, Layout, Tag } from '@appwrite.io/pink-svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import { ID, MessagingProviderType } from '@appwrite.io/console';
    import CustomId from '$lib/components/customId.svelte';
    import { IconPencil } from '@appwrite.io/pink-icons-svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import Targets from './(components)/targets.svelte';
    import Schedule from './(components)/schedule.svelte';
    import SmsPhone from '../../smsPhone.svelte';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let showCustomId = false;
    let id: string;
    let content: string;
    let topics: string[];
    let users: string[];
    let targets: string[];
    let draft: boolean;
    let scheduledAt: string;

    async function create() {
        try {
            const messageId = id || ID.unique();

            const response = await sdk.forProject.messaging.createSms(
                messageId,
                content,
                topics,
                users,
                targets,
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
                providerType: 'email',
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
    title="Create SMS message"
    href={`${base}/project-${$page.params.project}/messaging/`}
    bind:showExitModal
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Message">
                <Layout.Stack>
                    <InputTextarea
                        id="message"
                        label="Message"
                        required
                        maxlength={900}
                        placeholder="Type here..."
                        bind:value={content}>
                    </InputTextarea>
                    {#if !showCustomId}
                        <div>
                            <Tag size="s" on:click={() => (showCustomId = !showCustomId)}
                                ><Icon icon={IconPencil} /> Message ID</Tag>
                        </div>
                    {:else}
                        <CustomId autofocus bind:show={showCustomId} name="Message" bind:id />
                    {/if}
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Targets">
                <Targets type={MessagingProviderType.Sms} bind:topics bind:targets />
            </Fieldset>
            <Fieldset legend="Schedule">
                <Schedule bind:scheduledAt {targets} />
            </Fieldset>
        </Layout.Stack>
    </Form>
    <SmsPhone {content} slot="aside" />

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
