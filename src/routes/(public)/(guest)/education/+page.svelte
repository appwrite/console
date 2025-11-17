<script lang="ts">
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { OAuthProvider } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import GithubLogoDark from '$lib/images/github-logo-dark.svg';
    import GithubLogoLight from '$lib/images/github-logo-light.svg';
    import { base } from '$app/paths';
    import { resolvedProfile } from '$lib/profiles/index.svelte';

    function onGithubLogin() {
        localStorage.setItem('githubEducationProgram', 'true');
        sdk.forConsole.account.createOAuth2Session({
            provider: OAuthProvider.Github,
            success: window.location.origin + base + '/education?success',
            failure: window.location.origin + base + '/education?failure',
            scopes: ['read:user', 'user:email']
        });
    }
</script>

<svelte:head>
    <title>Sign up - {resolvedProfile.platform} Education Program</title>
</svelte:head>

<div class="content">
    <div class="logos">
        <img
            src={$app.themeInUse === 'light' ? AppwriteLogoLight : AppwriteLogoDark}
            alt="{resolvedProfile.platform} logo" />
        <div class="logo-divider"></div>
        <img
            src={$app.themeInUse === 'light' ? GithubLogoLight : GithubLogoDark}
            alt="Github logo" />
    </div>
    <h1>Join the {resolvedProfile.platform} Education Program</h1>
    <p>
        Enjoy {resolvedProfile.platform} Cloud for free throughout your student journey as part of the
        GitHub Student Developer Pack.
    </p>
    <Button fullWidth on:click={onGithubLogin}>
        <span class="icon-github" aria-hidden="true"></span>
        <span class="text">Sign up with GitHub</span>
    </Button>
</div>

<style>
    .content {
        @media (min-width: 768px) {
            width: 460px;
        }
    }

    .content h1 {
        font-family: var(--heading-font);
        font-size: 2rem;
        line-height: 2.125rem;
        margin-top: 2.5rem;
        color: var(--heading-color);
    }

    .content p {
        margin-top: 1.25rem;
        color: var(--text-color);
        font-size: 1.125rem;
        font-weight: 500;
        line-height: 1.625rem;
        margin-bottom: 2rem;
    }

    .content .logos {
        display: flex;
        flex-direction: row;
        gap: 1.5rem;
        height: 1.5rem;
    }

    .content .logo-divider {
        width: 2px;
        height: 100%;
        background-color: var(--divider-background-color);
    }
</style>
