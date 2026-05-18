<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { goto } from '$app/navigation';
    import { InputText, InputSwitch, Button } from '$lib/elements/forms';
    import { Icon, Layout } from '@appwrite.io/pink-svelte';
    import { IconDuplicate, IconRefresh } from '@appwrite.io/pink-icons-svelte';
    import { addNotification } from '$lib/stores/notifications';
    import { copy } from '$lib/helpers/copy';

    const STATE_KEY = 'appwrite-github-app-manifest-state';

    type GitHubAppCredentials = {
        slug: string;
        name: string;
        id: number;
        client_id: string;
        client_secret: string;
        webhook_secret: string;
        pem: string;
    };

    let hostname = $state('');
    let isOrg = $state(false);
    let orgName = $state('');
    let credentials = $state<GitHubAppCredentials | null>(null);
    let exchanging = $state(false);
    let copied = $state(false);
    let submitError = $state<string | null>(null);

    function isValidHostname(value: string): boolean {
        if (!value || value.startsWith('.') || value.endsWith('.')) return false;
        const parts = value.split('.');
        if (parts.length < 2) return false;
        for (const part of parts) {
            if (!part || part.startsWith('-') || part.endsWith('-')) return false;
            if (!/^[a-zA-Z0-9-]+$/.test(part)) return false;
        }
        return true;
    }

    function generateState(): string {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
    }

    function generateAppName(): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let suffix = '';
        for (let i = 0; i < 6; i++) suffix += chars[Math.floor(Math.random() * chars.length)];
        return `appwrite-self-hosted-${suffix}`;
    }

    function submit() {
        submitError = null;
        const state = generateState();
        sessionStorage.setItem(STATE_KEY, state);

        const host = hostname.replace(/^https?:\/\//, '').replace(/\/$/, '');
        const redirectUrl = new URL(page.url.origin + page.url.pathname);
        redirectUrl.searchParams.set('github_app_setup', 'callback');

        const manifest = JSON.stringify({
            name: generateAppName(),
            url: `https://${host}`,
            hook_attributes: { url: `https://${host}/v1/vcs/github/events` },
            redirect_url: redirectUrl.toString(),
            callback_urls: [
                `https://${host}/v1/vcs/github/callback`,
                `https://${host}/v1/account/sessions/oauth2/callback/github/console`
            ],
            request_oauth_on_install: true,
            setup_on_update: true,
            public: true,
            default_permissions: {
                administration: 'write',
                checks: 'write',
                statuses: 'write',
                contents: 'write',
                issues: 'write',
                metadata: 'read',
                pull_requests: 'write',
                repository_hooks: 'write',
                emails: 'read'
            },
            default_events: ['pull_request', 'push']
        });

        const baseUrl =
            isOrg && orgName.trim()
                ? `https://github.com/organizations/${orgName.trim()}/settings/apps/new`
                : 'https://github.com/settings/apps/new';

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${baseUrl}?state=${state}`;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'manifest';
        input.value = manifest;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }

    onMount(async () => {
        const code = page.url.searchParams.get('code');
        const state = page.url.searchParams.get('state');
        const setup = page.url.searchParams.get('github_app_setup');

        if (setup === 'callback' && code && state && !credentials && !exchanging) {
            await exchangeCode(code, state);
            const cleanUrl = new URL(page.url);
            ['code', 'state', 'github_app_setup'].forEach((p) => cleanUrl.searchParams.delete(p));
            await goto(cleanUrl.toString(), { replaceState: true, noScroll: true });
        }
    });

    async function exchangeCode(code: string, state: string) {
        exchanging = true;
        submitError = null;

        const storedState = sessionStorage.getItem(STATE_KEY);
        sessionStorage.removeItem(STATE_KEY);

        if (!storedState || storedState !== state) {
            submitError = 'State mismatch. This may be a CSRF attack. Please try again.';
            exchanging = false;
            return;
        }

        try {
            const response = await fetch(
                `https://api.github.com/app-manifests/${code}/conversions`,
                { method: 'POST', headers: { Accept: 'application/vnd.github+json' } }
            );
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                throw new Error(body?.message ?? `GitHub API returned ${response.status}`);
            }
            const data = await response.json();
            credentials = data as GitHubAppCredentials;
        } catch (e) {
            submitError = (e as Error).message;
            addNotification({ type: 'error', message: (e as Error).message });
        } finally {
            exchanging = false;
        }
    }

    const envVars = $derived.by(() => {
        if (!credentials) return '';
        const pem = credentials.pem.replace(/\n$/, '');
        const name = credentials.slug ?? credentials.name;
        return [
            `_APP_VCS_GITHUB_APP_NAME="${name}"`,
            `_APP_VCS_GITHUB_PRIVATE_KEY="${pem}"`,
            `_APP_VCS_GITHUB_APP_ID="${credentials.id}"`,
            `_APP_VCS_GITHUB_CLIENT_ID="${credentials.client_id}"`,
            `_APP_VCS_GITHUB_CLIENT_SECRET="${credentials.client_secret}"`,
            `_APP_VCS_GITHUB_WEBHOOK_SECRET="${credentials.webhook_secret}"`
        ].join('\n');
    });

    async function copyEnvVars() {
        const success = await copy(envVars);
        if (success) {
            copied = true;
            setTimeout(() => (copied = false), 2000);
        } else {
            addNotification({ type: 'error', message: 'Unable to copy to clipboard' });
        }
    }

    function reset() {
        credentials = null;
        submitError = null;
        hostname = '';
        isOrg = false;
        orgName = '';
        sessionStorage.removeItem(STATE_KEY);
    }

    const isValid = $derived(isValidHostname(hostname) && (!isOrg || orgName.trim().length > 0));
</script>

{#if exchanging}
    <Layout.Stack alignItems="center" gap="m">
        <span class="loader" aria-label="Creating GitHub App..."></span>
        <p class="text">Creating your GitHub App...</p>
    </Layout.Stack>
{:else if credentials}
    <Layout.Stack gap="l">
        <Layout.Stack gap="xs">
            <p class="body-text-1 u-bold">GitHub App created</p>
            <p class="text">
                Set these environment variables in the <code>.env</code> file of your Appwrite instance,
                then restart your instance.
            </p>
        </Layout.Stack>

        <div class="env-block">
            <div class="env-block-header">
                <span class="tag">.env</span>
                <button
                    type="button"
                    class="button is-text is-only-icon"
                    aria-label={copied ? 'Copied' : 'Copy to clipboard'}
                    onclick={copyEnvVars}>
                    <Icon icon={IconDuplicate} size="s" />
                </button>
            </div>
            <pre class="env-block-body"><code>{envVars}</code></pre>
        </div>

        <div>
            <Button secondary on:click={reset}>
                <Icon slot="start" icon={IconRefresh} size="s" />
                Create another GitHub App
            </Button>
        </div>
    </Layout.Stack>
{:else}
    <Layout.Stack gap="l">
        <Layout.Stack gap="xs">
            <p class="body-text-1 u-bold">Create GitHub App</p>
            <p class="text">
                Registers a GitHub App with the correct webhooks, permissions, and callback URLs
                pre-configured using the <a
                    class="u-underline"
                    href="https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest"
                    target="_blank"
                    rel="noreferrer">GitHub App manifest flow</a
                >. For manual configuration, use the
                <a
                    class="u-underline"
                    href="https://github.com/settings/apps/new"
                    target="_blank"
                    rel="noreferrer">GitHub app creation form</a> directly.
            </p>
        </Layout.Stack>

        {#if submitError}
            <p class="text u-color-text-danger">{submitError}</p>
        {/if}

        <Layout.Stack gap="l">
            <InputText
                id="github-hostname"
                label="Hostname"
                placeholder="appwrite.example.com"
                helper="Domain of your Appwrite instance, without https://"
                bind:value={hostname}
                required />
            <InputSwitch id="github-is-org" label="Create on organization?" bind:value={isOrg} />
            {#if isOrg}
                <InputText
                    id="github-org-name"
                    label="Organization handle"
                    placeholder="my-org"
                    bind:value={orgName}
                    required />
            {/if}
            <div>
                <Button on:click={submit} disabled={!isValid}>Create GitHub App</Button>
            </div>
        </Layout.Stack>
    </Layout.Stack>
{/if}

<style>
    .env-block {
        border: 1px solid hsl(var(--color-border));
        border-radius: var(--border-radius-medium);
        overflow: hidden;
        font-family: var(--font-code);
    }

    .env-block-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 0.75rem;
        border-bottom: 1px solid hsl(var(--color-border));
        background-color: hsl(var(--color-surface-2));
    }

    .tag {
        font-size: var(--font-size-0);
        color: hsl(var(--color-text-2));
    }

    .env-block-body {
        padding: 1rem;
        overflow-x: auto;
        white-space: pre;
        font-size: 0.75rem;
        line-height: 1.6;
        background-color: hsl(var(--color-surface-1));
        margin: 0;
        max-height: 320px;
        overflow-y: auto;
    }

    .loader {
        width: 2rem;
        height: 2rem;
        border: 3px solid hsl(var(--color-border));
        border-top-color: hsl(var(--color-primary));
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
