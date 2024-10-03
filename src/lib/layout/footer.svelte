<script>
    import { isCloud } from '$lib/system';
    import { version } from '$routes/(console)/store';

    const currentYear = new Date().getFullYear();
</script>

<footer class="main-footer u-cross-center">
    <div class="main-footer-start">
        <ul class="inline-links is-no-padding-first-and-last u-x-small u-flex-wrap u-gap-16">
            <li class="inline-links-item" style="line-height: 1.02;">
                <div class="u-flex u-cross-center u-gap-8">
                    {#if isCloud}
                        <span class="icon-cloud" />
                    {/if}
                    {#if $version}
                        <a
                            class="text"
                            href="https://github.com/appwrite/appwrite/releases"
                            aria-label="Appwrite releases on Github"
                            target="_blank"
                            rel="noreferrer">
                            Version {$version}
                        </a>
                    {/if}
                </div>
            </li>
            <li class="inline-links-item">
                <a href="https://appwrite.io/docs" target="_blank" rel="noreferrer">
                    <span class="text">Docs</span>
                </a>
            </li>
            <li class="inline-links-item">
                <a href="https://appwrite.io/terms" target="_blank" rel="noreferrer">
                    <span class="text">Terms</span>
                </a>
            </li>
            <li class="inline-links-item">
                <a href="https://appwrite.io/privacy" target="_blank" rel="noreferrer">
                    <span class="text">Privacy</span>
                </a>
            </li>
            {#if isCloud}
                <li class="inline-links-item">
                    <a href="https://appwrite.io/cookies" target="_blank" rel="noreferrer">
                        <span class="text">Cookies</span>
                    </a>
                </li>
            {/if}
        </ul>
    </div>
    <div class="main-footer-end">
        <ul class="inline-links is-no-padding-first-and-last u-x-small">
            <li class="inline-links-item">
                <span class="text">ⓒ {currentYear} Appwrite. All rights reserved.</span>
            </li>
            <li class="inline-links-item u-flex u-gap-8">
                <a
                    href="https://github.com/appwrite/appwrite"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Appwrite on Github">
                    <span class="icon-github" aria-hidden="true" />
                </a>
                <a
                    href="https://appwrite.io/discord"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Appwrite on Discord">
                    <span class="icon-discord" aria-hidden="true" />
                </a>
            </li>
        </ul>
    </div>
</footer>

<style lang="scss">
    .main-footer {
        margin-block-start: auto;
    }

    .main-footer-start .inline-links-item {
        padding-inline-end: 1rem;
        padding-inline-start: unset;
    }

    [class^='icon-']:not(.icon-cloud):not(:hover) {
        color: hsl(var(--color-neutral-50));
    }

    @media (max-width: 767.99px), (min-width: 768px) and (max-width: 1198.99px) {
        .main-footer {
            gap: 2rem;
        }
    }
</style>
