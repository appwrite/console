<script lang="ts">
    import { app } from '$lib/stores/app';
    import { sdk } from '$lib/stores/sdk';
    import { OAuthProvider } from '@appwrite.io/console';
    import { Button } from '$lib/elements/forms';

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
        sdk.forConsole.account.createOAuth2Session(
            OAuthProvider.Github,
            window.location.origin,
            window.location.origin,
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
    </div>
    <div class="content-container">
        <div class="content">
            <div class="logos">
                <img
                    src="/console/src/lib/images/github-education-program/appwrite-logo.svg"
                    alt="Appwrite logo" />
                <div class="logo-divider" />
                <img
                    src="/console/src/lib/images/github-education-program/github-logo.svg"
                    alt="Github logo" />
            </div>
            <h1>Join the Appwrite Education Program</h1>
            <p>
                Enjoy Appwrite Cloud for free throughout your student journey as part of the GitHub
                Student Developer Pack.
            </p>
            <Button fullWidth>
                <span class="icon-github" aria-hidden="true" />
                <span class="text">Sign up with GitHub</span>
            </Button>
        </div>
    </div>
</section>

<style>
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
                rgba(253, 54, 110, 0) 48.38%
            );

            display: flex;
            justify-content: center;
            align-items: center;
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
        background-color: #141416;
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
    }

    .content p {
        margin-top: 1.25rem;
        color: #e4e4e7a3;
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
