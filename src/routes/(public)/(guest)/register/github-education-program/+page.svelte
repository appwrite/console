<script lang="ts">
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { OAuthProvider } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';
    import AppwriteLogoDark from '$lib/images/appwrite-logo-dark.svg';
    import AppwriteLogoLight from '$lib/images/appwrite-logo-light.svg';
    import GithubLogoDark from '$lib/images/github-logo-dark.svg';
    import GithubLogoLight from '$lib/images/github-logo-light.svg';

    let artworkImageSrc;
    getArtworkImageSrc();
    monitorResize();

    function getArtworkImageSrc() {
        let isMobile = window.matchMedia('(max-width: 767px)').matches;
        if ($app.themeInUse === 'light' && isMobile) {
            artworkImageSrc =
                '/console/src/lib/images/github-education-program/artwork-light-mobile.svg';
        } else if ($app.themeInUse === 'light' && !isMobile) {
            artworkImageSrc = '/console/src/lib/images/github-education-program/artwork-light.svg';
        } else if ($app.themeInUse === 'dark' && isMobile) {
            artworkImageSrc =
                '/console/src/lib/images/github-education-program/artwork-dark-mobile.svg';
        } else {
            artworkImageSrc = '/console/src/lib/images/github-education-program/artwork-dark.svg';
        }
    }

    function onGithubLogin() {
        localStorage.setItem('githubEducationProgram', 'true');
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin + '/console/register/github-education-program?success',
            window.location.origin + '/console/register/github-education-program?failure',
            ['read:user', 'user:email']
        );
    }

    function monitorResize() {
        window.addEventListener('resize', getArtworkImageSrc);

        return {
            destroy() {
                window.removeEventListener('resize', getArtworkImageSrc);
            }
        };
    }
</script>

<svelte:head>
    <title>Sign up - Appwrite Education Program</title>
</svelte:head>
<section class="github-education-container">
    <div class="artwork">
        <img src={artworkImageSrc} alt="" />
        <div class="mobile-gradient" />
    </div>
    <div class="content-container">
        <div class="content">
            <div class="logos">
                <img
                    src={$app.themeInUse === 'light' ? AppwriteLogoLight : AppwriteLogoDark}
                    alt="Appwrite logo" />
                <div class="logo-divider" />
                <img
                    src={$app.themeInUse === 'light' ? GithubLogoLight : GithubLogoDark}
                    alt="Github logo" />
            </div>
            <h1>Join the Appwrite Education Program</h1>
            <p>
                Enjoy Appwrite Cloud for free throughout your student journey as part of the GitHub
                Student Developer Pack.
            </p>
            <Button fullWidth on:click={onGithubLogin}>
                <span class="icon-github" aria-hidden="true" />
                <span class="text">Sign up with GitHub</span>
            </Button>
        </div>
    </div>
</section>

<style>
    :global(.theme-dark) {
        --gradient-start-color: #0c0c0d;
        --heading-color: inherit;
        --text-color: #e4e4e7a3;
    }
    :global(.theme-light) {
        --gradient-start-color: #ededf0;
        --heading-color: #19191c;
        --text-color: #19191ca3;
    }

    .github-education-container {
        display: flex;
        flex-direction: column;

        @media (min-width: 768px) {
            flex-direction: row;
        }
    }

    .artwork {
        height: 16.5rem;
        width: 100%;
        display: flex;
        justify-content: center;

        @media (min-width: 768px) {
            width: 50%;
            min-height: 100vh;
            background: linear-gradient(
                56deg,
                rgba(253, 54, 110, 0.1) 0%,
                var(--gradient-start-color) 48.38%
            );

            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    .artwork .mobile-gradient {
        @media (max-width: 768px) {
            background: linear-gradient(
                180deg,
                rgba(25, 25, 28, 0) -4.43%,
                hsl(var(--p-body-bg-color)) 100%
            );
            position: absolute;
            width: 100%;
            height: 16.5rem;
        }
    }

    .artwork img {
        width: 100%;

        @media (min-width: 768px) {
            max-width: 500px;
            height: 100%;
        }
    }

    .content-container {
        background-color: hsl(var(--p-body-bg-color));
        width: 100%;
        padding: 1rem;

        @media (min-width: 768px) {
            width: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

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
        width: 1px;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.06);
    }
</style>
