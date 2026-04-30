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
    import { updateOAuth } from '../updateOAuth';
    import type { Models, Models as ConsoleModels } from '@appwrite.io/console';
    import { oAuthProviders } from '$lib/stores/oauth-providers';
    import {
        Alert,
        Card,
        Divider,
        Icon,
        Layout,
        Link,
        Tag,
        Typography
    } from '@appwrite.io/pink-svelte';
    import { IconDocument, IconPencil, IconUpload, IconX } from '@appwrite.io/pink-icons-svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';

    const projectId = page.params.project;
    const region = page.params.region;

    export let provider: Models.AuthProvider;
    export let show = false;
    export let parameters: ConsoleModels.ConsoleOAuth2ProviderParameter[] = [];

    $: appIdParam = parameters.length >= 1 ? parameters[0] : null;
    $: secretParams = parameters.slice(1);

    let enabled: boolean = provider.enabled;
    let appId: string = provider.appId || null;
    /** Values for all non-appId parameters, keyed by parameter.$id */
    let secretValues: Record<string, string | null> = {};
    let showSecretInput = !provider.appId;

    $: {
        for (const p of secretParams) {
            if (!(p.$id in secretValues)) {
                secretValues[p.$id] = null;
            }
        }
    }

    $: oAuthProvider = oAuthProviders[provider.key];

    /** Take only the primary name before any " or " / ", or " alternatives. */
    function primaryName(name: string): string {
        return name.split(/,?\s+or\s+/i)[0].trim();
    }

    function isPasswordParam(id: string): boolean {
        return id.toLowerCase().includes('secret');
    }

    function isP8Param(id: string): boolean {
        return id === 'p8File' || id === 'p8' || id.toLowerCase().includes('p8file');
    }

    let p8PasteMode: Record<string, boolean> = {};

    async function handleP8FileUpload(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;
        secretValues[id] = await file.text();
        input.value = '';
    }

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
                            {#if isP8Param(param.$id)}
                                <div>
                                    <Layout.Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="center">
                                        <Typography.Text variant="m-400"
                                            >{primaryName(param.name)}</Typography.Text>
                                        <Button
                                            text
                                            extraCompact
                                            on:click={() =>
                                                (p8PasteMode[param.$id] = !p8PasteMode[param.$id])}>
                                            {p8PasteMode[param.$id]
                                                ? 'Upload file instead'
                                                : 'Paste instead'}
                                        </Button>
                                    </Layout.Stack>
                                    {#if p8PasteMode[param.$id]}
                                        <InputTextarea
                                            id={param.$id}
                                            label=""
                                            placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
                                            helper={param.hint || undefined}
                                            bind:value={secretValues[param.$id]} />
                                    {:else}
                                        <label
                                            class="p8-upload-zone"
                                            class:has-file={!!secretValues[param.$id]}
                                            for="p8-file-{param.$id}">
                                            {#if secretValues[param.$id]}
                                                <Icon icon={IconDocument} size="s" />
                                                <Typography.Text
                                                    >File loaded — click to replace</Typography.Text>
                                                <Button
                                                    text
                                                    extraCompact
                                                    on:click={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        secretValues[param.$id] = null;
                                                    }}>
                                                    <Icon icon={IconX} size="s" />
                                                </Button>
                                            {:else}
                                                <Icon icon={IconUpload} size="m" />
                                                <Typography.Text
                                                    >Click to upload .p8 file</Typography.Text>
                                            {/if}
                                        </label>
                                        <input
                                            id="p8-file-{param.$id}"
                                            type="file"
                                            accept=".p8"
                                            style="display:none"
                                            on:change={(e) => handleP8FileUpload(param.$id, e)} />
                                    {/if}
                                </div>
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

    <Alert.Inline status="info">
        To complete set up, add this OAuth2 redirect URI to your {provider.name} app configuration.
    </Alert.Inline>
    <CopyInput
        label="URI"
        value={`${getApiEndpoint(page.params.region)}/account/sessions/oauth2/callback/${provider.key}/${projectId}`} />
    <svelte:fragment slot="footer">
        <Button secondary on:click={() => (provider = null)}>Cancel</Button>
        <Button disabled={nothingChanged} submit>Update</Button>
    </svelte:fragment>
</Modal>

<style>
    .p8-upload-zone {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        padding: var(--space-5) var(--space-6);
        border: 1px dashed var(--border-neutral-secondary);
        border-radius: var(--border-radius-small);
        cursor: pointer;
        background: var(--bgcolor-neutral-secondary);
        transition: border-color 0.15s;
        margin-top: var(--space-2);
    }

    .p8-upload-zone:hover {
        border-color: var(--border-neutral-primary);
    }

    .p8-upload-zone.has-file {
        border-style: solid;
        border-color: var(--border-neutral-primary);
    }
</style>
