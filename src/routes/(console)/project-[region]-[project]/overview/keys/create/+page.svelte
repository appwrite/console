<script lang="ts">
    import { base } from '$app/paths';
    import { page } from '$app/state';
    import { InputText } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import ExpirationInput from '../expirationInput.svelte';
    import Scopes from '../scopes.svelte';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { onboarding } from '$routes/(console)/project-[region]-[project]/store';
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
    let scopes = [];

    async function create() {
        try {
            const { $id } = await sdk.forConsole.projects.createKey(
                page.params.project,
                name,
                scopes,
                expire || undefined
            );

            if ($onboarding) {
                await invalidate(Dependencies.PROJECT);
            }
            trackEvent(Submit.KeyCreate, {
                scopes: scopes
            });
            goto(
                `${base}/project-${page.params.region}-${page.params.project}/overview/keys/${$id}`
            );
            addNotification({
                message: `API key has been created`,
                type: 'success'
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyCreate);
        }
    }
</script>

<Wizard
    title="Create API key"
    href={`${base}/project-${page.params.region}-${page.params.project}/overview/keys/`}
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
                        placeholder="API key name"
                        required
                        bind:value={name} />
                    <ExpirationInput bind:value={expire} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Scopes">
                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose which permission scopes to grant your application. It is best
                        practice to allow only the permissions you need to meet your project goals.
                    </Typography.Text>
                    <Scopes bind:scopes />
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
