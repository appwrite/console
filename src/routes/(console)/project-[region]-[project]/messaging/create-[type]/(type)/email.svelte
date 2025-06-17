<script lang="ts">
    import { page } from '$app/state';
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
    import InputText from '$lib/elements/forms/inputText.svelte';
    import InputTextarea from '$lib/elements/forms/inputTextarea.svelte';
    import Targets from './(components)/targets.svelte';
    import Schedule from './(components)/schedule.svelte';
    import InputSwitch from '$lib/elements/forms/inputSwitch.svelte';
    import { getProjectRoute } from '$lib/helpers/project';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);
    let showCustomId = false;
    let id: string;
    let subject: string;
    let content: string;
    let topics: string[];
    let users: string[];
    let targets: string[];
    let draft: boolean = false;
    let html: boolean = false;
    let scheduledAt: string = undefined;

    async function create() {
        try {
            const messageId = id || ID.unique();

            const response = await sdk
                .forProject(page.params.region, page.params.project)
                .messaging.createEmail(
                    messageId,
                    subject,
                    content,
                    topics,
                    users,
                    targets,
                    undefined,
                    undefined,
                    undefined,
                    draft,
                    html,
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
            await goto(getProjectRoute(`/messaging/message-${response.$id}`));
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
    title="Create email message"
    columnSize="s"
    href={getProjectRoute('/messaging/')}
    bind:showExitModal
    column
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Message">
                <Layout.Stack>
                    <InputText
                        id="subject"
                        label="Subject"
                        required
                        placeholder="Enter subject"
                        bind:value={subject}>
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
                        required
                        placeholder="Type here..."
                        bind:value={content}>
                    </InputTextarea>
                    <InputSwitch label="HTML mode" id="html" bind:value={html}>
                        <svelte:fragment slot="description">
                            Enable the HTML mode if your message contains HTML tags.
                        </svelte:fragment>
                    </InputSwitch>
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Targets">
                <Targets type={MessagingProviderType.Email} bind:topics bind:targets />
            </Fieldset>
            <Fieldset legend="Schedule">
                <Schedule bind:scheduledAt {targets} />
            </Fieldset>
        </Layout.Stack>
    </Form>
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
