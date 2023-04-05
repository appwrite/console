<script>
    import { Mode, MODE } from '$lib/system';

    import { version } from '$routes/console/store';

    const currentYear = new Date().getFullYear();
</script>

<footer class="main-footer u-cross-center">
    <div class="main-footer-start">
        <ul class="inline-links is-no-padding-first-and-last u-x-small">
            <li class="inline-links-item">
                <div class="u-flex u-cross-center u-gap-8">
                    {#if MODE !== Mode.CLOUD}
                        <span class="icon-cloud" />
                    {/if}
                    {#if $version}
                        <a
                            class="text"
                            href="https://github.com/appwrite/appwrite/releases"
                            target="_blank"
                            rel="noreferrer">
                            Version {$version}
                        </a>
                    {/if}
                </div>
            </li>
            <li class="inline-links-item">
                <a href="https://appwrite.io/policy/terms" target="_blank" rel="noreferrer">
                    <span class="text">Terms</span>
                </a>
            </li>
            <li class="inline-links-item">
                <a href="https://appwrite.io/policy/privacy" target="_blank" rel="noreferrer">
                    <span class="text">Privacy</span>
                </a>
            </li>
        </ul>
    </div>
    <div class="main-footer-end">
        <ul class="inline-links is-no-padding-first-and-last u-x-small">
            <li class="inline-links-item">
                <span class="text">ⓒ {currentYear} Appwrite. All rights reserved.</span>
            </li>
            <li class="inline-links-item u-flex u-gap-8">
                <a href="https://github.com/appwrite/appwrite" target="_blank" rel="noreferrer">
                    <span class="icon-github" aria-hidden="true" aria-label="Appwrite on Github" />
                </a>
                <a href="https://appwrite.io/discord" target="_blank" rel="noreferrer">
                    <span
                        class="icon-discord"
                        aria-hidden="true"
                        aria-label="Appwrite on Discord" />
                </a>
            </li>
        </ul>
    </div>
</footer>

<style lang="scss">
    .main-footer {
        margin-block-start: auto;
    }

    [class^='icon-']:not(.icon-cloud):not(:hover) {
        color: hsl(var(--color-neutral-50));
    }
</style>
