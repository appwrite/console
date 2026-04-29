<script lang="ts">
    import { page } from '$app/state';
    import { CopyInput, Modal } from '$lib/components';
    import {
        Button,
        InputPassword,
        InputSwitch,
        InputText,
        InputTextarea
    } from '$lib/elements/forms';
    import { onMount } from 'svelte';
    import { updateOAuth } from '../updateOAuth';
    import type { Models } from '@appwrite.io/console';
    import { oAuthProviders, type Provider } from '$lib/stores/oauth-providers';
    import {
        Alert,
        Card,
        Divider,
        Icon,
        Layout,
        Link,
        Spinner,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconPencil, IconX } from '@appwrite.io/pink-icons-svelte';
    import { getApiEndpoint, sdk } from '$lib/stores/sdk';
    import type { Models as ConsoleModels } from '@appwrite.io/console';

    const projectId = page.params.project;
    const region = page.params.region;

    export let provider: Models.AuthProvider;
    export let show = false;

    let loading = true;
    let enabled: boolean = null;
    let appId: string = null;
    /** Values for all non-appId parameters, keyed by parameter.$id */
    let secretValues: Record<string, string | null> = {};
    let showSecretInput = false;
    let oAuthProvider: Provider;

    let appIdParam: ConsoleModels.ConsoleOAuth2ProviderParameter | null = null;
    let secretParams: ConsoleModels.ConsoleOAuth2ProviderParameter[] = [];

    /** Take only the primary name before any " or " / ", or " alternatives. */
    function primaryName(name: string): string {
        return name.split(/,?\s+or\s+/i)[0].trim();
    }

    function isPasswordParam(id: string): boolean {
        return id.toLowerCase().includes('secret');
    }

    function isTextareaParam(id: string): boolean {
        return id === 'p8' || id.toLowerCase().includes('p8file');
    }

    onMount(async () => {
        oAuthProvider = oAuthProviders[provider.key];

        const providerList = await sdk.forConsole.console.listOAuth2Providers();
        const consoleProvider = providerList.oAuth2Providers.find((p) => p.$id === provider.key);

        if (consoleProvider?.parameters?.length >= 1) {
            appIdParam = consoleProvider.parameters[0];
            secretParams = consoleProvider.parameters.slice(1);
        }

        // Initialise all secret value slots
        for (const p of secretParams) {
            secretValues[p.$id] = null;
        }

        // Initialise form values only after params are ready — no flash
        enabled = provider.enabled;
        appId = provider.appId || null;
        showSecretInput = !provider.appId;
        loading = false;
    });

    /** Build the secret string to pass to updateOAuth. */
    function buildSecret(): string | null {
        const entries = secretParams
            .map((p) => [p.$id, secretValues[p.$id]] as [string, string | null])
            .filter(([, v]) => v !== null && v !== '');

        if (entries.length === 0) return null;
        if (secretParams.length === 1) return entries[0]?.[1] ?? null;
        return JSON.stringify(Object.fromEntries(entries));
    }

    $: hasSecretInput = Object.values(secretValues).some((v) => v !== null && v !== '');
    $: nothingChanged =
        enabled === provider?.enabled && appId === provider?.appId && !hasSecretInput;

    let error: string;

    const update = async () => {
        const result = await updateOAuth({
            region,
            projectId,
            provider,
            appId,
            secret: buildSecret(),
            enabled
        });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    $: secretCardTitle =
        secretParams.length === 1 ? primaryName(secretParams[0]?.name ?? '') : 'Credentials';
</script>

<Modal {error} bind:show onSubmit={update} on:close title={`${provider.name} OAuth2 settings`}>
    <p slot="description">
        To use {provider.name} authentication in your application, first fill in this form. For more info
        you can
        <Link.Anchor
            class="link"
            href={oAuthProvider?.docs}
            target="_blank"
            rel="noopener noreferrer">visit the docs.</Link.Anchor>
    </p>

    {#if loading}
        <Layout.Stack alignItems="center">
            <Spinner size="m" />
        </Layout.Stack>
    {:else}
        <InputSwitch id="state" bind:value={enabled} label={enabled ? 'Enabled' : 'Disabled'} />

        {#if appIdParam}
            <InputText
                id="appID"
                label={primaryName(appIdParam.name)}
                autofocus={true}
                placeholder={appIdParam.example || ''}
                helper={appIdParam.hint || undefined}
                bind:value={appId} />
        {/if}

        {#if secretParams.length > 0}
            {#if !showSecretInput}
                <div>
                    <Tag size="s" on:click={() => (showSecretInput = true)}>
                        <Icon icon={IconPencil} size="s" /> Update {secretCardTitle}
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
                                <Typography.Text variant="m-600">{secretCardTitle}</Typography.Text>
                                <Button
                                    extraCompact
                                    on:click={() => {
                                        showSecretInput = false;
                                        for (const p of secretParams) {
                                            secretValues[p.$id] = null;
                                        }
                                    }}>
                                    <Icon icon={IconX} size="s" />
                                </Button>
                            </Layout.Stack>
                            <Typography.Text>
                                {#if secretParams.length === 1}
                                    This field is write-only. Enter a new value to update it.
                                {:else}
                                    These fields are write-only. Enter new values to update them.
                                {/if}
                            </Typography.Text>
                        </Layout.Stack>
                        <span
                            style="margin-left: calc(-1 * var(--space-7)); margin-right: calc(-1 * var(--space-7)); width: auto;">
                            <Divider />
                        </span>
                        <Layout.Stack>
                            {#each secretParams as param}
                                {#if isTextareaParam(param.$id)}
                                    <InputTextarea
                                        id={param.$id}
                                        label={primaryName(param.name)}
                                        placeholder={param.example || ''}
                                        helper={param.hint || undefined}
                                        bind:value={secretValues[param.$id]} />
                                {:else if isPasswordParam(param.$id)}
                                    <InputPassword
                                        id={param.$id}
                                        label={primaryName(param.name)}
                                        placeholder={param.example || ''}
                                        helper={param.hint || undefined}
                                        minlength={0}
                                        bind:value={secretValues[param.$id]} />
                                {:else}
                                    <InputText
                                        id={param.$id}
                                        label={primaryName(param.name)}
                                        placeholder={param.example || ''}
                                        helper={param.hint || undefined}
                                        bind:value={secretValues[param.$id]} />
                                {/if}
                            {/each}
                        </Layout.Stack>
                    </Layout.Stack>
                </Card.Base>
            {/if}
        {/if}
    {/if}

    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
    </Alert.Inline>
    <CopyInput
        label="URI"
        value={`${getApiEndpoint(page.params.region)}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button disabled={loading || nothingChanged} submit>Update</Button>
    </svelte:fragment>
</Modal>
