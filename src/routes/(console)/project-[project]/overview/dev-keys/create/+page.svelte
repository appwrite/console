<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/stores';
    import { InputText } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout } from '@appwrite.io/pink-svelte';
    import ExpirationInput from '../../components/expirationInput.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { onboarding } from '$routes/(console)/project-[project]/store';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    let name = '',
        expire = '';

    async function create() {
        try {
            const { $id } = await sdk.forConsole.projects.createDevKey(
                $page.params.project,
                name,
                expire || undefined
            );

            if ($onboarding) {
                await invalidate(Dependencies.PROJECT);
            }
            trackEvent(Submit.DevKeyCreate);
            goto(`${base}/project-${$page.params.project}/overview/dev-keys/${$id}`);
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
        }
    }
</script>

<Wizard
    title="Create Dev key"
    href={`${base}/project-${$page.params.project}/overview/dev-keys/`}
    bind:showExitModal
    column
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Configuration">
                <Layout.Stack>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Dev key name"
                        required
                        bind:value={name} />
                    <ExpirationInput bind:value={expire} />
                </Layout.Stack>
            </Fieldset>
        </Layout.Stack>
    </Form>

    <svelte:fragment slot="footer">
        <Button fullWidthMobile secondary on:click={() => (showExitModal = true)}>Cancel</Button>
        <Button
            fullWidthMobile
            on:click={() => formComponent.triggerSubmit()}
            disabled={$isSubmitting}>
            Create
        </Button>
    </svelte:fragment>
</Wizard>
