<script>
    import { isCloud } from '$lib/system';
    import { version } from '$routes/(console)/store';
    import { IconCloud, IconDiscord, IconGithub } from '@appwrite.io/pink-icons-svelte';
    import {
        Layout,
        Typography,
        Link,
        Icon,
        Divider,
        Button,
        Badge
    } from '@appwrite.io/pink-svelte';
    import { isSmallViewport, isTabletViewport } from '$lib/stores/viewport';

    const currentYear = new Date().getFullYear();
</script>

<footer>
    <Divider />
    <Layout.Stack direction={$isSmallViewport ? 'column-reverse' : 'row'}>
        <Layout.Stack
            direction="row"
            alignItems="center"
            gap={$isSmallViewport ? 'm' : 'l'}
            inline={$isTabletViewport}
            justifyContent="flex-start">
            <Typography.Caption variant="400">
                ⓒ {currentYear} Appwrite. All rights reserved.
            </Typography.Caption>
            <span class="divider-wrapper">
                <Divider vertical />
            </span>
            <Layout.Stack direction="row" gap="xxs" inline>
                <Button.Anchor
                    icon
                    size="xs"
                    variant="ghost"
                    href="https://github.com/appwrite/appwrite"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Appwrite on Github">
                    <Icon size="s" icon={IconGithub} />
                </Button.Anchor>
                <Button.Anchor
                    icon
                    size="xs"
                    variant="ghost"
                    href="https://appwrite.io/discord"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Appwrite on Discord">
                    <Icon size="s" icon={IconDiscord} />
                </Button.Anchor>
            </Layout.Stack>
        </Layout.Stack>
        {#if isCloud && $isSmallViewport}
            <div class="extra-margin">
                <Layout.Stack direction="row" justifyContent={'flex-start'} alignItems="center">
                    {#if $version}
                        {#if isCloud}
                            <Icon size="s" icon={IconCloud} />
                        {/if}
                        <Link.Anchor
                            size="s"
                            variant="quiet"
                            href="https://github.com/appwrite/appwrite/releases"
                            aria-label="Appwrite releases on Github"
                            target="_blank"
                            rel="noreferrer">
                            Version {$version}
                        </Link.Anchor>
                        <span class="divider-wrapper">
                            <Divider vertical />
                        </span>
                    {/if}
                    <Badge size="xs" variant="secondary" content="BETA" />
                </Layout.Stack>
            </div>
        {/if}
        <Layout.Stack
            direction="row"
            justifyContent={$isSmallViewport ? 'flex-start' : 'flex-end'}
            alignItems="center">
            {#if isCloud}
                {#if !$isSmallViewport}<Badge size="xs" variant="secondary" content="BETA" /><Icon
                        size="s"
                        icon={IconCloud} />
                    {#if $version}
                        <Link.Anchor
                            size="s"
                            variant="quiet"
                            href="https://github.com/appwrite/appwrite/releases"
                            aria-label="Appwrite releases on Github"
                            target="_blank"
                            rel="noreferrer">
                            Version {$version}
                        </Link.Anchor>
                        <span class="divider-wrapper">
                            <Divider vertical />
                        </span>
                    {/if}
                {/if}
            {/if}

            <Link.Anchor
                size="s"
                variant="quiet"
                href="https://appwrite.io/docs"
                target="_blank"
                rel="noreferrer">
                Docs
            </Link.Anchor>
            <span class="divider-wrapper">
                <Divider vertical />
            </span>
            <Link.Anchor
                size="s"
                variant="quiet"
                href="https://appwrite.io/terms"
                target="_blank"
                rel="noreferrer">
                Terms
            </Link.Anchor>
            <span class="divider-wrapper">
                <Divider vertical />
            </span>
            <Link.Anchor
                size="s"
                variant="quiet"
                href="https://appwrite.io/privacy"
                target="_blank"
                rel="noreferrer">
                Privacy
            </Link.Anchor>
            {#if isCloud}
                <span class="divider-wrapper">
                    <Divider vertical />
                </span>
                <Link.Anchor
                    size="s"
                    variant="quiet"
                    href="https://appwrite.io/cookies"
                    target="_blank"
                    rel="noreferrer">
                    Cookies
                </Link.Anchor>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</footer>

<style lang="scss">
    .divider-wrapper {
        height: 18px;
    }
    footer {
        margin-block-start: auto;
        padding-block: 1rem;
        display: flex;
        flex-direction: column;
        gap: var(--gap-l);
        margin-inline: 2rem;
    }

    :global(main:has(.sub-navigation)) footer {
        @media (min-width: 1024px) {
            margin-inline-start: 0;
            margin-inline-end: 2rem;
        }
    }
    .extra-margin {
        margin-block-start: var(--space-2, 4px);
    }
</style>
