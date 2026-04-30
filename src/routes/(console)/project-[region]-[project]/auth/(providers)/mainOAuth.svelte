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
    import { OAuthProvider, type Models, type Models as ConsoleModels } from '@appwrite.io/console';
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
    import { IconDocument, IconPencil, IconUpload, IconX } from '@appwrite.io/pink-icons-svelte';
    import { getApiEndpoint } from '$lib/stores/sdk';

    const projectId = page.params.project;
    const region = page.params.region;

    export let provider: Models.AuthProvider;
    export let show = false;
    export let parameters: ConsoleModels.ConsoleOAuth2ProviderParameter[] = [];

    let enabled: boolean = provider.enabled;
    let appId: string = provider.appId || null;
    let providerKeyId = (provider as Models.AuthProvider & { keyId?: string })?.keyId || null;
    let fieldValues: Record<string, string | null> = {};
    let showSecretInput =
        !provider.appId || (provider.key === OAuthProvider.Apple && !providerKeyId);
    let p8PasteMode: Record<string, boolean> = {};
    let error: string;

    $: appIdParam = parameters.length >= 1 ? parameters[0] : null;
    $: additionalParams = parameters.slice(1);
    $: detailParams = additionalParams.filter((param) => !isSecretParam(param.$id));
    $: secretParams = additionalParams.filter((param) => isSecretParam(param.$id));
    $: basicDetailParams =
        provider?.key === OAuthProvider.Oidc
            ? detailParams.filter((param) => !isOidcAdvancedParam(param.$id))
            : detailParams;
    $: advancedDetailParams =
        provider?.key === OAuthProvider.Oidc
            ? detailParams.filter((param) => isOidcAdvancedParam(param.$id))
            : [];
    $: hasSecretInput = secretParams.some((param) => {
        const value = fieldValues[param.$id];
        return value !== null && value !== '';
    });
    $: hasDetailChanges = detailParams.some((param) => {
        const value = fieldValues[param.$id];
        return value !== null && value !== '';
    });
    $: nothingChanged =
        enabled === provider?.enabled &&
        appId === provider?.appId &&
        !hasSecretInput &&
        !hasDetailChanges;
    $: oAuthProvider = oAuthProviders[provider.key];
    $: secretCardTitle =
        secretParams.length === 1 ? primaryName(secretParams[0]?.name ?? '') : 'Credentials';

    $: {
        for (const param of additionalParams) {
            if (!(param.$id in fieldValues)) {
                fieldValues[param.$id] = getInitialFieldValue(param.$id);
            }
        }
    }

    function primaryName(name: string): string {
        return name.trim();
    }

    function helperText(hint?: string | null): string | undefined {
        const value = hint?.trim();

        if (!value || /^example of wrong value:/i.test(value)) {
            return undefined;
        }

        return value;
    }

    function getInitialFieldValue(id: string): string | null {
        const value = (provider as Record<string, unknown>)[id];
        return typeof value === 'string' ? value : null;
    }

    function isPasswordParam(id: string): boolean {
        return id.toLowerCase().includes('secret');
    }

    function isP8Param(id: string): boolean {
        return id === 'p8File' || id === 'p8' || id.toLowerCase().includes('p8file');
    }

    function isSecretParam(id: string): boolean {
        return isPasswordParam(id) || isP8Param(id);
    }

    function isOidcAdvancedParam(id: string): boolean {
        return id === 'authorizationURL' || id === 'tokenUrl' || id === 'userInfoUrl';
    }

    async function handleP8FileUpload(id: string, event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        fieldValues[id] = await file.text();
        input.value = '';
    }

    function buildSecret(): string | null {
        const entries = secretParams.flatMap((param) => {
            const value = fieldValues[param.$id];

            if (value === null || value === '') {
                return [];
            }

            return [[param.$id, value] as [string, string]];
        });

        if (entries.length === 0) return null;
        if (secretParams.length === 1) return entries[0]?.[1] ?? null;

        return JSON.stringify(Object.fromEntries(entries));
    }

    function buildDetails(): Record<string, string> {
        return Object.fromEntries(
            detailParams.map((param) => [param.$id, fieldValues[param.$id] ?? ''])
        );
    }

    function resetWriteOnlyInputs() {
        showSecretInput = false;

        for (const param of secretParams) {
            fieldValues[param.$id] = null;
        }
    }

    const update = async () => {
        const result = await updateOAuth({
            region,
            projectId,
            provider,
            appId,
            secret: buildSecret(),
            details: buildDetails(),
            enabled
        });

        if (result.status === 'error') {
            error = result.message;
        } else {
            provider = null;
        }
    };

    // @todo Revisit explicit secret-clearing UX later today. For now, credentials remain update-only.
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
            helper={helperText(appIdParam.hint)}
            bind:value={appId} />
    {/if}

    {#each basicDetailParams as param}
        <InputText
            id={param.$id}
            label={primaryName(param.name)}
            placeholder={param.example || ''}
            helper={helperText(param.hint)}
            bind:value={fieldValues[param.$id]} />
    {/each}

    {#if advancedDetailParams.length > 0}
        <Accordion title="Advanced" badge="Optional" hideDivider>
            <Layout.Stack gap="l">
                {#each advancedDetailParams as param}
                    <InputText
                        id={param.$id}
                        label={primaryName(param.name)}
                        placeholder={param.example || ''}
                        helper={helperText(param.hint)}
                        bind:value={fieldValues[param.$id]} />
                {/each}
            </Layout.Stack>
        </Accordion>
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
                            <Button extraCompact on:click={resetWriteOnlyInputs}>
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
                                <div class="p8-field">
                                    <div class="p8-field-header">
                                        <Typography.Text variant="m-400"
                                            >{primaryName(param.name)}</Typography.Text>
                                        <div class="p8-field-controls">
                                            <Button
                                                text
                                                extraCompact
                                                on:click={() =>
                                                    (p8PasteMode[param.$id] =
                                                        !p8PasteMode[param.$id])}>
                                                {p8PasteMode[param.$id]
                                                    ? 'Upload file instead'
                                                    : 'Paste instead'}
                                            </Button>
                                        </div>
                                    </div>
                                    {#if p8PasteMode[param.$id]}
                                        <InputTextarea
                                            id={param.$id}
                                            label=""
                                            placeholder={'-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----'}
                                            helper={helperText(param.hint)}
                                            bind:value={fieldValues[param.$id]} />
                                    {:else}
                                        <label
                                            class="p8-upload-zone"
                                            class:has-file={!!fieldValues[param.$id]}
                                            for="p8-file-{param.$id}">
                                            {#if fieldValues[param.$id]}
                                                <Icon icon={IconDocument} size="s" />
                                                <Typography.Text
                                                    >File loaded — click to replace</Typography.Text>
                                                <Button
                                                    text
                                                    extraCompact
                                                    on:click={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        fieldValues[param.$id] = null;
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
                                            on:change={(event) =>
                                                handleP8FileUpload(param.$id, event)} />
                                    {/if}
                                </div>
                            {:else}
                                <InputPassword
                                    id={param.$id}
                                    label={primaryName(param.name)}
                                    placeholder={param.example || ''}
                                    helper={helperText(param.hint)}
                                    minlength={0}
                                    bind:value={fieldValues[param.$id]} />
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

    .p8-field {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }

    .p8-field-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: var(--space-4);
        min-width: 0;
    }

    .p8-field-controls {
        display: inline-flex;
        align-items: center;
        gap: var(--space-4);
        min-width: 0;
        flex-shrink: 0;
    }
</style>
