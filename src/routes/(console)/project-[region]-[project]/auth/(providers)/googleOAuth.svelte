<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import { Button, InputPassword, InputSwitch, InputText } from '$lib/elements/forms';
    import { updateOAuth } from '../updateOAuth';
    import {
        OAuthProvider,
        ProjectOAuth2GooglePrompt,
        type Models as ConsoleModels
    } from '@appwrite.io/console';
    import type { AuthProvider } from '../updateOAuth';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import {
        Accordion,
        Alert,
        Card,
        Divider,
        Icon,
        Layout,
        Link,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconPencil, IconX } from '@appwrite.io/pink-icons-svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';
    import GooglePromptPicker from './googlePromptPicker.svelte';

    const projectId = page.params.project;
    const region = page.params.region;

    export let provider: AuthProvider;
    export let show = false;
    export let parameters: ConsoleModels.ConsoleOAuth2ProviderParameter[] = [];

    let enabled: boolean = provider.enabled;
    let appId: string | null = null;
    let clientSecret: string | null = null;
    let showSecretInput = false;
    let prompt: ProjectOAuth2GooglePrompt[] = [];
    let error: string;
    let initializedProvider: AuthProvider | null = null;
    let initialEnabled = false;
    let initialAppId: string | null = null;
    let initialPrompt: ProjectOAuth2GooglePrompt[] = [];

    $: appIdParam = parameters.length >= 1 ? parameters[0] : null;
    $: hasSecretInput = clientSecret !== null && clientSecret !== '';

    $: nothingChanged =
        enabled === initialEnabled &&
        normalizeFieldValue(appId) === normalizeFieldValue(initialAppId) &&
        !hasSecretInput &&
        [...prompt].sort().join(',') === [...initialPrompt].sort().join(',');

    $: oAuthProvider = oAuthProviders[provider.key];

    $: if (provider && provider !== initializedProvider) {
        initializedProvider = provider;
        initialEnabled = provider.enabled;
        initialAppId = getInitialAppId();
        enabled = initialEnabled;
        appId = initialAppId;
        clientSecret = null;
        showSecretInput = !appId;
        error = undefined;
        const rawPrompt = (provider as Record<string, unknown>)['prompt'];
        initialPrompt = Array.isArray(rawPrompt)
            ? ([...rawPrompt] as ProjectOAuth2GooglePrompt[])
            : [];
        prompt = [...initialPrompt];
    }

    function getInitialAppId(): string | null {
        const value = (provider as Record<string, unknown>)['clientId'];
        return typeof value === 'string' ? value : null;
    }

    function normalizeFieldValue(value: string | null | undefined): string {
        return value ?? '';
    }

    function helperText(hint?: string | null): string | undefined {
        const value = hint?.trim();
        return value || undefined;
    }

    function resetSecretInput() {
        showSecretInput = false;
        clientSecret = null;
    }

    const update = async () => {
        const result = await updateOAuth({
            region,
            projectId,
            provider,
            appId,
            secret: clientSecret ? JSON.stringify({ clientSecret }) : null,
            details: {},
            promptValues: prompt,
            enabled
        });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };
</script>

<Modal {error} bind:show onSubmit={update} on:close title="Google OAuth2 settings">
    <p slot="description">
        To use Google authentication in your application, first fill in this form. For more info you
        can
        <Link.Anchor
            class="link"
            href={oAuthProvider?.docs}
            target="_blank"
            rel="noopener noreferrer">visit the docs.</Link.Anchor>
    </p>

    <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />

    {#if appIdParam}
        <InputText
            id="appID"
            label={appIdParam.name.trim()}
            autofocus={true}
            placeholder={appIdParam.example || ''}
            helper={helperText(appIdParam.hint)}
            required={enabled && !!appIdParam.example}
            bind:value={appId} />
    {/if}

    {#if !showSecretInput}
        <div>
            <Tag size="s" on:click={() => (showSecretInput = true)}>
                <Icon icon={IconPencil} size="s" /> Update Client Secret
            </Tag>
        </div>
    {:else}
        <Card.Base
            variant="secondary"
            padding="s"
            --input-background-color="var(--bgcolor-neutral-primary)">
            <Layout.Stack gap="xl">
                <Layout.Stack gap="s">
                    <Layout.Stack
                        direction="row"
                        justifyContent="space-between"
                        alignContent="center">
                        <Typography.Text variant="m-600">Client Secret</Typography.Text>
                        <Button extraCompact on:click={resetSecretInput}>
                            <Icon icon={IconX} size="s" />
                        </Button>
                    </Layout.Stack>
                    <Typography.Text>
                        This field is write-only. Enter a new value to update it.
                    </Typography.Text>
                </Layout.Stack>
                <span
                    style="margin-left: calc(-1 * var(--space-7)); margin-right: calc(-1 * var(--space-7)); width: auto;">
                    <Divider />
                </span>
                <Layout.Stack>
                    <InputPassword
                        id="clientSecret"
                        label="Client Secret"
                        placeholder="Client Secret"
                        minlength={0}
                        bind:value={clientSecret} />
                </Layout.Stack>
            </Layout.Stack>
        </Card.Base>
    {/if}

    <Accordion title="Advanced" badge="Optional" hideDivider>
        <GooglePromptPicker bind:value={prompt} />
    </Accordion>

    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your Google app configuration.
    </Alert.Inline>
    <CopyInput
        label="URI"
        value={`${getApiEndpoint(page.params.region)}/account/sessions/oauth2/callback/${OAuthProvider.Google}/${projectId}`} />

    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button disabled={nothingChanged} submit>Update</Button>
    </svelte:fragment>
</Modal>
