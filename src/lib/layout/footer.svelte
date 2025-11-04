<script>
    import { isCloud, isSelfHosted } from '$lib/system';
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
    import { isSmallViewport } from '$lib/stores/viewport';
    import { page } from '$app/state';
    import { PLATFORM, resolvedProfile } from '$lib/profiles/index.svelte.ts';

    const currentYear = new Date().getFullYear();

    const hideFooter = $derived.by(() => {
        const endings = ['table-[table]', 'table-[table]/columns', 'table-[table]/indexes'];
        return endings.some((end) => page.route.id?.endsWith(end));
    });
</script>

<footer class:hide={hideFooter}>
    <Divider />
    <Layout.Stack direction={$isSmallViewport ? 'column-reverse' : 'row'}>
        <Layout.Stack
            direction="row"
            alignItems="center"
            gap={$isSmallViewport ? 'm' : 'l'}
            justifyContent="flex-start">
            <Typography.Caption variant="400">
                ⓒ {currentYear}
                {PLATFORM} . All rights reserved.
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

        <Layout.Stack
            direction="row"
            justifyContent={$isSmallViewport ? 'flex-start' : 'flex-end'}
            alignItems="center"
            wrap={$isSmallViewport ? 'wrap' : 'normal'}>
            {#if !$isSmallViewport}
                {#if isCloud && resolvedProfile.showGeneralAvailability}
                    <Badge
                        size="xs"
                        type="success"
                        variant="secondary"
                        content="Generally Available"
                        style="white-space: nowrap;" />
                    <Icon size="s" icon={IconCloud} />
                {/if}

                {#if $version && isSelfHosted}
                    <Link.Anchor
                        size="s"
                        variant="quiet"
                        href="https://github.com/appwrite/appwrite/releases"
                        aria-label="Appwrite releases on Github"
                        target="_blank"
                        rel="noreferrer"
                        style="white-space: nowrap;">
                        Version {$version}
                    </Link.Anchor>
                    <span class="divider-wrapper">
                        <Divider vertical />
                    </span>
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
            {#if $isSmallViewport}
                {#if $version && !isCloud}
                    <span class="divider-wrapper">
                        <Divider vertical />
                    </span>

                    <Link.Anchor
                        size="s"
                        variant="quiet"
                        href="https://github.com/appwrite/appwrite/releases"
                        aria-label="Appwrite releases on Github"
                        target="_blank"
                        rel="noreferrer"
                        style="white-space: nowrap;">
                        Version {$version}
                    </Link.Anchor>
                {/if}

                {#if isCloud && resolvedProfile.showGeneralAvailability}
                    <Icon size="s" icon={IconCloud} />

                    <Badge
                        size="xs"
                        type="success"
                        variant="secondary"
                        content="Generally Available"
                        style="white-space: nowrap;" />
                {/if}
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

        &.hide {
            display: none;
        }

        & :global(i) {
            // because the `IconCloud` shows above floating action bars.
            position: unset;
        }
    }

    :global(main:has(.sub-navigation)) footer {
        @media (min-width: 1024px) {
            margin-inline-end: 2rem;
            margin-inline-start: -1.5rem;
        }
    }

    :global(main:has(.wide-screen-wrapper)) footer {
        margin-inline-start: 2rem !important;
    }
</style>
