<script lang="ts">
    import Button from '$lib/elements/forms/button.svelte';
    import { canWriteKeys } from '$lib/stores/roles';
    import { Icon, Modal, Layout } from '@appwrite.io/pink-svelte';
    import { IconPlus } from '@appwrite.io/pink-icons-svelte';
    import { Form, InputText } from '$lib/elements/forms/index.js';
    import ExpirationInput from '../components/expirationInput.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { goto } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { base } from '$app/paths';
    import { addNotification } from '$lib/stores/notifications';
    import { page } from '$app/stores';

    let showModal = false;
    let isSubmitting = false;
    let name = '',
        expire = '';

    const projectId = $page.params.project;

    async function create() {
        try {
            isSubmitting = true;
            const { $id } = await sdk.forConsole.projects.createDevKey(
                projectId,
                name,
                expire || undefined
            );

            showModal = false;
            trackEvent(Submit.DevKeyCreate);
            await goto(`${base}/project-${projectId}/overview/dev-keys/${$id}`);
            addNotification({
                message: `Dev key has been created`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.DevKeyCreate);
        } finally {
            isSubmitting = false;
        }
    }
</script>

{#if $canWriteKeys}
    <Button on:click={() => (showModal = true)}>
        <Icon icon={IconPlus} slot="start" size="s" />
        Create Dev key
    </Button>

    <Form onSubmit={create} isModal>
        <Modal title="Create Dev key" bind:open={showModal}>
            <span slot="description">
                Test your app without rate limits and more detailed error messages.
            </span>

            <Layout.Stack>
                <InputText
                    id="name"
                    label="Name"
                    placeholder="Dev key name"
                    required
                    bind:value={name} />

                <ExpirationInput bind:value={expire} keyType="dev" />
            </Layout.Stack>

            <Layout.Stack direction="row" justifyContent="flex-end" slot="footer">
                <Button fullWidthMobile secondary on:click={() => (showModal = false)}
                    >Cancel</Button>
                <Button fullWidthMobile submit disabled={isSubmitting}>Create</Button>
            </Layout.Stack>
        </Modal>
    </Form>
{/if}
