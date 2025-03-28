<script lang="ts">
    import {
        ArtworkDark,
        ArtworkDarkMobile,
        ArtworkLightMobile,
        ArtworkLight
    } from '$lib/images/github-education-program';
</script>

<svelte:head>
    <title>Sign up - Appwrite Education Program</title>
</svelte:head>
<section class="github-education-container">
    <div class="artwork">
        <div class="is-only-mobile">
            <img src={ArtworkDarkMobile} alt="" class=" u-only-dark" />
            <img src={ArtworkLightMobile} alt="" class="u-only-light" />
        </div>
        <div class="is-not-mobile">
            <img src={ArtworkDark} alt="" class="u-only-dark" />
            <img src={ArtworkLight} alt="" class="u-only-light" />
        </div>
        <div class="mobile-gradient"></div>
    </div>
    <div class="content-container">
        <slot />
    </div>
</section>

<style>
    :global(.theme-dark) {
        --gradient-start-color: #0c0c0d;
        --heading-color: inherit;
        --text-color: #e4e4e7a3;
        --divider-background-color: rgba(255, 255, 255, 0.06);
    }
    :global(.theme-light) {
        --gradient-start-color: #ededf0;
        --heading-color: #19191c;
        --text-color: #19191ca3;
        --divider-background-color: rgba(25, 25, 28, 0.04);
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
                rgba(253, 54, 110, 0.15) 0%,
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
</style>
