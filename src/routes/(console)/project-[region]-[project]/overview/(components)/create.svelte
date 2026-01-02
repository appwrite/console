<script lang="ts">
    import { base } from '$app/paths';
    import { InputText } from '$lib/elements/forms/index.js';
    import { Wizard } from '$lib/layout';
    import { Fieldset, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { ExpirationInput } from '$lib/components';
    import Button from '$lib/elements/forms/button.svelte';
    import Form from '$lib/elements/forms/form.svelte';
    import { sdk } from '$lib/stores/sdk';
    import { onboarding } from '../../store';
    import { goto, invalidate } from '$app/navigation';
    import { Dependencies } from '$lib/constants';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { addNotification } from '$lib/stores/notifications';
    import { writable } from 'svelte/store';
    import Scopes from '../api-keys/scopes.svelte';
    import { page } from '$app/state';
    import { copy } from '$lib/helpers/copy';
    import type { Models } from '@appwrite.io/console';

    export let type: 'api' | 'organization' | 'account' = 'api';

    const projectId = page.params.project;

    let showExitModal = false;
    let formComponent: Form;
    let isSubmitting = writable(false);

    let scopes: string[] = [];
    let name = '';
    let expire: string | null = null;

    async function createProjectKey(): Promise<Models.Key> {
        const key = await sdk.forConsole.projects.createKey({
            projectId,
            name,
            scopes,
            expire: expire || undefined
        });

        if ($onboarding) {
            await invalidate(Dependencies.PROJECT);
        }

        await goto(
            `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/${key.$id}`
        );

        return key;
    }

    async function createOrganizationKey(): Promise<Models.Key> {
        const key = await sdk.forConsole.organizations.createKey({
            organizationId: page.params.organization,
            name,
            scopes,
            expire: expire || undefined
        });

        await invalidate(Dependencies.ORGANIZATION);

        await goto(getResourcePath());

        return key;
    }

    async function createAccountKey(): Promise<Models.Key> {
        const key = await sdk.forConsole.account.createKey({
            name,
            scopes,
            expire: expire || undefined
        });

        await invalidate(Dependencies.ACCOUNT);

        await goto(getResourcePath());

        return key;
    }

    async function create() {
        try {
            let key: Models.Key;
            switch (type) {
                case 'api':
                    key = await createProjectKey();
                    break;
                case 'organization':
                    key = await createOrganizationKey();
                    break;
                case 'account':
                    key = await createAccountKey();
                    break;
            }

            trackEvent(Submit.KeyCreate);

            const resource = getResource().charAt(0).toUpperCase() + getResource().slice(1);

            const buttons = [
                {
                    name: 'Copy ' + getResource(),
                    method: async () => {
                        await copy(key.secret);
                    }
                }
            ];

            if (showCopyEndpoint()) {
                buttons.push({
                    name: 'Copy endpoint',
                    method: async () => {
                        await copy(sdk.forConsole.client.config.endpoint);
                    }
                });
            }

            addNotification({
                message: `${resource} has been created`,
                type: 'success',
                buttons
            });
        } catch (error) {
            addNotification({
                type: 'error',
                message: error.message
            });
            trackError(error, Submit.KeyCreate);
        }
    }

    function showCopyEndpoint() {
        switch (type) {
            case 'api':
                return true;
            case 'organization':
                return false;
            case 'account':
                return false;
        }
    }

    function getResourcePath() {
        switch (type) {
            case 'api':
                return `${base}/project-${page.params.region}-${page.params.project}/overview/api-keys/`;
            case 'organization':
                return `${base}/organization-${page.params.organization}/integrations`;
            case 'account':
                return `${base}/account/integrations`;
        }
    }

    function getResource() {
        switch (type) {
            case 'api':
                return 'API key';
            case 'organization':
                return 'organization key';
            case 'account':
                return 'account token';
        }
    }
</script>

<Wizard
    title={'Create ' + getResource()}
    href={getResourcePath()}
    bind:showExitModal
    column
    columnSize="s"
    confirmExit>
    <Form bind:this={formComponent} onSubmit={create} bind:isSubmitting>
        <Layout.Stack gap="xxl">
            <Fieldset legend="Configuration">
                <Layout.Stack>
                    <InputText
                        id="name"
                        label="Name"
                        placeholder="Enter key name"
                        required
                        bind:value={name} />

                    <ExpirationInput bind:value={expire} />
                </Layout.Stack>
            </Fieldset>

            <Fieldset legend="Scopes">
                <Layout.Stack gap="xl">
                    <Typography.Text>
                        Choose which permission scopes to grant your {getResource()}. It is best
                        practice to allow only the permissions you need to meet your goals.
                    </Typography.Text>
                    <Scopes bind:scopes {type} />
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
