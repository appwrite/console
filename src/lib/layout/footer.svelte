<script>
    import { isCloud } from '$lib/system';
    import { version } from '$routes/(console)/store';
    import { IconCloud, IconDiscord, IconGithub } from '@appwrite.io/pink-icons-svelte';
    import { Layout, Typography, Link, Icon, Divider } from '@appwrite.io/pink-svelte';

    const currentYear = new Date().getFullYear();
</script>

<footer>
    <Divider />
    <Layout.Stack direction="row">
        <Layout.Stack direction="row">
            <Typography.Caption variant="400">
                ⓒ {currentYear} Appwrite. All rights reserved.
            </Typography.Caption>
            <Link.Anchor
                variant="quiet"
                href="https://github.com/appwrite/appwrite"
                target="_blank"
                rel="noreferrer"
                aria-label="Appwrite on Github">
                <Icon size="s" icon={IconGithub} />
            </Link.Anchor>
            <Link.Anchor
                variant="quiet"
                href="https://appwrite.io/discord"
                target="_blank"
                rel="noreferrer"
                aria-label="Appwrite on Discord">
                <Icon size="s" icon={IconDiscord} />
            </Link.Anchor>
        </Layout.Stack>
        <Layout.Stack direction="row" justifyContent="flex-end">
            {#if isCloud}
                <Icon size="s" icon={IconCloud} />
            {/if}
            {#if $version}
                <Link.Anchor
                    variant="quiet"
                    href="https://github.com/appwrite/appwrite/releases"
                    aria-label="Appwrite releases on Github"
                    target="_blank"
                    rel="noreferrer">
                    <Typography.Caption variant="400">Version {$version}</Typography.Caption>
                </Link.Anchor>
            {/if}
            <Link.Anchor
                variant="quiet"
                href="https://appwrite.io/docs"
                target="_blank"
                rel="noreferrer">
                <Typography.Caption variant="400">Docs</Typography.Caption>
            </Link.Anchor>
            <Link.Anchor
                variant="quiet"
                href="https://appwrite.io/terms"
                target="_blank"
                rel="noreferrer">
                <Typography.Caption variant="400">Terms</Typography.Caption>
            </Link.Anchor>
            <Link.Anchor
                variant="quiet"
                href="https://appwrite.io/privacy"
                target="_blank"
                rel="noreferrer">
                <Typography.Caption variant="400">Privacy</Typography.Caption>
            </Link.Anchor>
            {#if isCloud}
                <Link.Anchor
                    variant="quiet"
                    href="https://appwrite.io/cookies"
                    target="_blank"
                    rel="noreferrer">
                    <Typography.Caption variant="400">Cookies</Typography.Caption>
                </Link.Anchor>
            {/if}
        </Layout.Stack>
    </Layout.Stack>
</footer>

<style lang="scss">
    footer {
        margin-block-start: auto;
        margin-inline: 2rem;
        padding-block: 1rem;
        display: flex;
        flex-direction: column;
        gap: var(--gap-l);
    }
</style>
