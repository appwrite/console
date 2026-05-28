<script lang="ts">
    import { invalidate } from '$app/navigation';
    import { Submit, trackError, trackEvent } from '$lib/actions/analytics';
    import { CardGrid } from '$lib/components';
    import { Dependencies } from '$lib/constants';
    import { Button, Form, InputNumber, InputTags, InputText } from '$lib/elements/forms';
    import InputSelect from '$lib/elements/forms/inputSelect.svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { canWriteProjects } from '$lib/stores/roles';
    import { sdk } from '$lib/stores/sdk';
    import { Divider, Icon, Layout, Selector, Tooltip, Typography } from '@appwrite.io/pink-svelte';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import deepEqual from 'deep-equal';
    import { project } from '../store';

    type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

    const multipliers: Record<TimeUnit, number> = {
        seconds: 1,
        minutes: 60,
        hours: 3600,
        days: 86400
    };

    const unitOptions: { value: TimeUnit; label: string }[] = [
        { value: 'seconds', label: 'Seconds' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'hours', label: 'Hours' },
        { value: 'days', label: 'Days' }
    ];

    function fromSeconds(
        s: number | null,
        defaultUnit: TimeUnit = 'hours'
    ): { value: number | null; unit: TimeUnit } {
        if (s === null) return { value: null, unit: defaultUnit };
        if (s % 86400 === 0) return { value: s / 86400, unit: 'days' };
        if (s % 3600 === 0) return { value: s / 3600, unit: 'hours' };
        if (s % 60 === 0) return { value: s / 60, unit: 'minutes' };
        return { value: s, unit: 'seconds' };
    }

    function toSeconds(value: number | null, unit: TimeUnit): number | null {
        return value !== null ? value * multipliers[unit] : null;
    }

    let enabled = $state(false);
    let authorizationUrl = $state('');
    let scopes = $state<string[]>([]);

    let accessTokenValue = $state<number | null>(null);
    let accessTokenUnit = $state<TimeUnit>('hours');
    let refreshTokenValue = $state<number | null>(null);
    let refreshTokenUnit = $state<TimeUnit>('days');
    let publicAccessTokenValue = $state<number | null>(null);
    let publicAccessTokenUnit = $state<TimeUnit>('hours');
    let publicRefreshTokenValue = $state<number | null>(null);
    let publicRefreshTokenUnit = $state<TimeUnit>('days');
    let confidentialPkce = $state(false);

    const accessTokenDuration = $derived(toSeconds(accessTokenValue, accessTokenUnit));
    const refreshTokenDuration = $derived(toSeconds(refreshTokenValue, refreshTokenUnit));
    const publicAccessTokenDuration = $derived(
        toSeconds(publicAccessTokenValue, publicAccessTokenUnit)
    );
    const publicRefreshTokenDuration = $derived(
        toSeconds(publicRefreshTokenValue, publicRefreshTokenUnit)
    );

    const isButtonDisabled = $derived(
        !$canWriteProjects ||
            deepEqual(
                {
                    enabled,
                    authorizationUrl,
                    scopes,
                    accessTokenDuration,
                    refreshTokenDuration,
                    publicAccessTokenDuration,
                    publicRefreshTokenDuration,
                    confidentialPkce
                },
                {
                    enabled: $project.oAuth2ServerEnabled ?? false,
                    authorizationUrl: $project.oAuth2ServerAuthorizationUrl ?? '',
                    scopes: $project.oAuth2ServerScopes ?? [],
                    accessTokenDuration: $project.oAuth2ServerAccessTokenDuration ?? null,
                    refreshTokenDuration: $project.oAuth2ServerRefreshTokenDuration ?? null,
                    publicAccessTokenDuration:
                        $project.oAuth2ServerPublicAccessTokenDuration ?? null,
                    publicRefreshTokenDuration:
                        $project.oAuth2ServerPublicRefreshTokenDuration ?? null,
                    confidentialPkce: $project.oAuth2ServerConfidentialPkce ?? false
                }
            )
    );

    async function update() {
        try {
            await sdk.forProject($project.region, $project.$id).project.updateOAuth2Server({
                enabled,
                authorizationUrl,
                scopes,
                accessTokenDuration: accessTokenDuration ?? undefined,
                refreshTokenDuration: refreshTokenDuration ?? undefined,
                publicAccessTokenDuration: publicAccessTokenDuration ?? undefined,
                publicRefreshTokenDuration: publicRefreshTokenDuration ?? undefined,
                confidentialPkce
            });

            await invalidate(Dependencies.PROJECT);

            addNotification({
                type: 'success',
                message: 'OAuth2 server settings have been updated.'
            });
            trackEvent(Submit.ProjectUpdateOAuth2Server);
        } catch (error) {
            addNotification({ type: 'error', message: error.message });
            trackError(error, Submit.ProjectUpdateOAuth2Server);
        }
    }

    $effect(() => {
        enabled = $project.oAuth2ServerEnabled ?? false;
        authorizationUrl = $project.oAuth2ServerAuthorizationUrl ?? '';
        scopes = $project.oAuth2ServerScopes ?? [];

        const at = fromSeconds($project.oAuth2ServerAccessTokenDuration ?? null, 'hours');
        accessTokenValue = at.value;
        accessTokenUnit = at.unit;

        const rt = fromSeconds($project.oAuth2ServerRefreshTokenDuration ?? null, 'days');
        refreshTokenValue = rt.value;
        refreshTokenUnit = rt.unit;

        const pat = fromSeconds($project.oAuth2ServerPublicAccessTokenDuration ?? null, 'hours');
        publicAccessTokenValue = pat.value;
        publicAccessTokenUnit = pat.unit;

        const prt = fromSeconds($project.oAuth2ServerPublicRefreshTokenDuration ?? null, 'days');
        publicRefreshTokenValue = prt.value;
        publicRefreshTokenUnit = prt.unit;

        confidentialPkce = $project.oAuth2ServerConfidentialPkce ?? false;
    });
</script>

<Form onSubmit={update}>
    <CardGrid>
        <svelte:fragment slot="title">OAuth2 server</svelte:fragment>
        Configure your project as an OAuth2 authorization server. When enabled, external applications
        can authenticate users through your project using the OAuth2 protocol.
        <svelte:fragment slot="aside">
            <Selector.Switch
                id="oauth2-server-enabled"
                bind:checked={enabled}
                label="Enable OAuth2 server"
                description="Allow external applications to authenticate users through your project."
                disabled={!$canWriteProjects} />

            {#if enabled}
                <InputText
                    id="oauth2-authorization-url"
                    label="Authorization URL"
                    bind:value={authorizationUrl}
                    required
                    placeholder="https://example.com/consent"
                    disabled={!$canWriteProjects}>
                    <Tooltip slot="info">
                        <Icon icon={IconInfo} size="s" />
                        <span slot="tooltip"
                            >The consent screen URL shown to users during the OAuth2 authorization
                            flow.</span>
                    </Tooltip>
                </InputText>

                <InputTags
                    id="oauth2-scopes"
                    label="Scopes"
                    bind:tags={scopes}
                    placeholder="e.g. profile"
                    max={100}
                    disabled={!$canWriteProjects}>
                    <Tooltip slot="info">
                        <Icon icon={IconInfo} size="s" />
                        <span slot="tooltip"
                            >OAuth2 scopes this server will accept. Up to 100 scopes, each up to 128
                            characters long.</span>
                    </Tooltip>
                </InputTags>

                <Divider />

                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-500">Confidential clients</Typography.Text>
                    <Typography.Caption variant="400">
                        Server-side apps that authenticate with a client secret.
                    </Typography.Caption>
                </Layout.Stack>

                <div class="duration-field">
                    <InputNumber
                        id="oauth2-access-token-duration"
                        label="Access token duration"
                        bind:value={accessTokenValue}
                        placeholder="8"
                        min={1}
                        disabled={!$canWriteProjects} />
                    <InputSelect
                        id="oauth2-access-token-unit"
                        required
                        bind:value={accessTokenUnit}
                        options={unitOptions}
                        disabled={!$canWriteProjects} />
                </div>

                <div class="duration-field">
                    <InputNumber
                        id="oauth2-refresh-token-duration"
                        label="Refresh token duration"
                        bind:value={refreshTokenValue}
                        placeholder="365"
                        min={1}
                        disabled={!$canWriteProjects} />
                    <InputSelect
                        id="oauth2-refresh-token-unit"
                        required
                        bind:value={refreshTokenUnit}
                        options={unitOptions}
                        disabled={!$canWriteProjects} />
                </div>

                <Selector.Switch
                    id="oauth2-confidential-pkce"
                    bind:checked={confidentialPkce}
                    label="Require PKCE"
                    description="When enabled, confidential clients must use PKCE in addition to their client secret. Public clients always require PKCE."
                    disabled={!$canWriteProjects} />

                <Divider />

                <Layout.Stack gap="xs">
                    <Typography.Text variant="m-500">Public clients</Typography.Text>
                    <Typography.Caption variant="400">
                        SPAs, mobile, and native apps that cannot keep a client secret.
                    </Typography.Caption>
                </Layout.Stack>

                <div class="duration-field">
                    <InputNumber
                        id="oauth2-public-access-token-duration"
                        label="Access token duration"
                        bind:value={publicAccessTokenValue}
                        placeholder="1"
                        min={1}
                        disabled={!$canWriteProjects} />
                    <InputSelect
                        id="oauth2-public-access-token-unit"
                        required
                        bind:value={publicAccessTokenUnit}
                        options={unitOptions}
                        disabled={!$canWriteProjects} />
                </div>

                <div class="duration-field">
                    <InputNumber
                        id="oauth2-public-refresh-token-duration"
                        label="Refresh token duration"
                        bind:value={publicRefreshTokenValue}
                        placeholder="30"
                        min={1}
                        disabled={!$canWriteProjects} />
                    <InputSelect
                        id="oauth2-public-refresh-token-unit"
                        required
                        bind:value={publicRefreshTokenUnit}
                        options={unitOptions}
                        disabled={!$canWriteProjects} />
                </div>
            {/if}
        </svelte:fragment>
        <svelte:fragment slot="actions">
            <Button submit disabled={isButtonDisabled}>Update</Button>
        </svelte:fragment>
    </CardGrid>
</Form>

<style>
    .duration-field {
        display: grid;
        grid-template-columns: 1fr 8rem;
        gap: var(--space-4);
        align-items: end;
    }
</style>
