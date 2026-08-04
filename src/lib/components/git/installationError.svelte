<script lang="ts">
    /**
     * Shared rendering for a VCS call that failed because of the installation
     * itself, rather than because the repository, branch or directory is
     * genuinely empty.
     *
     * Use this anywhere a Git surface would otherwise show "No repositories
     * found", "No branches available" or a spinner that never resolves. It
     * explains what happened and offers the action that actually fixes it.
     *
     * Reconnecting is a plain full page redirect to the provider's authorize
     * endpoint. The callback upserts onto the existing installation row, so the
     * stored token is replaced in place and the installation never has to be
     * removed first. That is why the label is "Reconnect installation" and not
     * "Remove and reconnect".
     */
    import { page } from '$app/state';
    import { Alert, Layout, Typography } from '@appwrite.io/pink-svelte';
    import { Button } from '$lib/elements/forms';
    import { connectGitHub, connectGitea } from '$lib/stores/git';
    import { canWriteVcs } from '$lib/stores/roles';
    import type { VcsInstallationErrorKind } from '$lib/helpers/vcsError';

    type Props = {
        kind: VcsInstallationErrorKind;
        /** Installation provider (`github`, `gitea`); unknown values hide the reconnect link. */
        provider?: string;
        /** Installation owner, shown so the user knows which account is affected. */
        organization?: string;
        /** Retry the failed request. Shown as the primary action for transient kinds. */
        onRetry?: () => void;
    };

    let {
        kind,
        provider = undefined,
        organization = undefined,
        onRetry = undefined
    }: Props = $props();

    /**
     * The providers this console can actually re-authorize. GitLab is not a Git
     * installation provider here (it only exists as an end user OAuth2 provider
     * and as a template source), so there is deliberately no entry for it, and
     * an unknown provider renders without a reconnect link rather than pointing
     * at a fabricated authorize URL.
     */
    const providers: Record<string, { label: string; connect: () => URL }> = {
        github: { label: 'GitHub', connect: connectGitHub },
        gitea: { label: 'Gitea', connect: connectGitea }
    };

    const knownProvider = $derived(providers[provider?.toLowerCase() ?? '']);

    /**
     * Provider and owner, so the user knows which account broke. Untranslated on
     * purpose: both halves are proper nouns.
     */
    const identity = $derived(
        [knownProvider?.label ?? provider, organization].filter(Boolean).join(' / ')
    );

    const copy = $derived.by(() => {
        if (kind === 'reconnect') {
            return {
                status: 'warning' as const,
                title: 'Reconnect this Git installation',
                description:
                    'Appwrite can no longer access this Git provider on your behalf. Reconnect the installation to restore access to your repositories.',
                reconnectIsPrimary: true
            };
        }

        if (kind === 'locked') {
            return {
                status: 'info' as const,
                title: 'This installation is being refreshed',
                description:
                    'Another request is already refreshing this installation. Try again in a moment.',
                reconnectIsPrimary: false
            };
        }

        return {
            status: 'warning' as const,
            title: 'Could not reach the Git provider',
            description: 'This is usually temporary. Try again in a moment.',
            reconnectIsPrimary: false
        };
    });

    /**
     * A held refresh lock means the installation is fine, so never send the user
     * off to re-authorize over it. A provider outage keeps the link as a
     * secondary action, because a dead token can also surface as one.
     */
    const showReconnect = $derived(kind !== 'locked');

    const reconnectUrl = $derived.by(() => {
        // `connectGitHub` / `connectGitea` read the project and region off the
        // current route, so there is nothing to link to outside a project.
        if (!showReconnect || !knownProvider || !$canWriteVcs || !page.params.project) return null;
        return knownProvider.connect().toString();
    });
</script>

<Alert.Inline status={copy.status} title={copy.title}>
    <Layout.Stack gap="xxs">
        <span>{copy.description}</span>
        {#if identity}
            <Typography.Caption variant="400" color="--fgcolor-neutral-tertiary">
                {identity}
            </Typography.Caption>
        {/if}
    </Layout.Stack>

    <!-- Always passed: `svelte:fragment` has to be a direct child of the component,
         so the per kind conditionals live inside it. -->
    <svelte:fragment slot="actions">
        {#if copy.reconnectIsPrimary && reconnectUrl}
            <Button compact href={reconnectUrl} event="vcs_installation_reconnect">
                Reconnect installation
            </Button>
        {/if}

        {#if onRetry}
            <Button
                compact={!copy.reconnectIsPrimary}
                text={copy.reconnectIsPrimary}
                on:click={onRetry}>
                Try again
            </Button>
        {/if}

        {#if !copy.reconnectIsPrimary && reconnectUrl}
            <Button text href={reconnectUrl} event="vcs_installation_reconnect">
                Reconnect installation
            </Button>
        {/if}
    </svelte:fragment>
</Alert.Inline>
