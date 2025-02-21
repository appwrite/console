<script lang="ts">
    import { Card, Trim } from '$lib/components/index.js';
    import Link from '$lib/elements/link.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import {
        Badge,
        Divider,
        Icon,
        Image,
        Layout,
        Status,
        Tooltip,
        Typography
    } from '@appwrite.io/pink-svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import { Button } from '$lib/elements/forms';
    import { IconExternalLink, IconInfo, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import OpenOnMobileModal from './openOnMobileModal.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { protocol } from '$routes/(console)/store';
    import { app } from '$lib/stores/app';
    import { base } from '$app/paths';
    import { isCloud } from '$lib/system';

    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList = { total: 0, rules: [] };
    export let hideQRCode = false;

    let show = false;
    const siteUrl =
        deployment.domain ?? (proxyRuleList.total > 0 ? proxyRuleList.rules[0].domain : undefined);

    $: totalSize = humanFileSize((deployment?.buildSize ?? 0) + (deployment?.size ?? 0));

    function getScreenshot(theme: string, deployment: Models.Deployment) {
        if (theme === 'dark') {
            return deployment.screenshotDark
                ? getFilePreview(deployment.screenshotDark)
                : `${base}/images/sites/screenshot-placeholder-dark.svg`;
        }

        return deployment.screenshotLight
            ? getFilePreview(deployment.screenshotLight)
            : `${base}/images/sites/screenshot-placeholder-light.svg`;
    }

    function getFilePreview(fileId: string) {
        // TODO: @Meldiron use sdk.forConsole.storage.getFilePreview
        return `http://localhost/v1/storage/buckets/screenshots/files/${fileId}/view?project=console&mode=admin`;
    }
</script>

<Card padding="s" radius="m">
    <Layout.Stack gap="l">
        <!-- <Layout.Stack gap="xl" direction="row" alignItems="center"> -->
        <div class="card-grid">
            <Image
                border
                radius="s"
                ratio="16/9"
                style="width: 100%; align-self: start"
                src={getScreenshot($app.themeInUse, deployment)}
                alt="Screenshot" />

            <Layout.Stack gap="xl">
                <Layout.Stack direction="row" alignItems="flex-start">
                    <Layout.Stack direction="row" gap="xl">
                        {#if deployment.status === 'failed'}
                            <Layout.Stack gap="xxs" inline>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-tertiary">
                                    Status
                                </Typography.Text>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-primary">
                                    <Status status={deployment.status} label={deployment.status} />
                                </Typography.Text>
                            </Layout.Stack>
                        {:else}
                            <Layout.Stack gap="xxs" inline>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-tertiary">
                                    Deployed
                                </Typography.Text>
                                <Typography.Text
                                    variant="m-400"
                                    color="--color-fgcolor-neutral-primary">
                                    <DeploymentCreatedBy {deployment} />
                                </Typography.Text>
                            </Layout.Stack>
                        {/if}
                    </Layout.Stack>
                    {#if siteUrl && !hideQRCode}
                        <Button icon secondary on:click={() => (show = true)}>
                            <Icon icon={IconQrcode} size="l" />
                        </Button>
                    {/if}
                </Layout.Stack>
                {#if proxyRuleList?.total}
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            Domains
                        </Typography.Text>
                        <DeploymentDomains domains={proxyRuleList} />
                    </Layout.Stack>
                {:else if deployment.domain}
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            Domains
                        </Typography.Text>
                        <Link external href={`${$protocol}${deployment.domain}`} variant="muted">
                            <Layout.Stack gap="xxs" direction="row" alignItems="center">
                                <Trim alternativeTrim>
                                    <Typography.Text
                                        variant="m-400"
                                        color="--color-fgcolor-neutral-primary">
                                        {deployment.domain}
                                    </Typography.Text>
                                </Trim>
                                <Icon icon={IconExternalLink} size="s" />
                            </Layout.Stack>
                        </Link>
                    </Layout.Stack>
                {/if}
                <Layout.Stack gap="xxl" direction="row" wrap="wrap">
                    {#if deployment?.buildTime}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-tertiary">
                                Build time
                            </Typography.Text>
                            <Typography.Text
                                variant="m-400"
                                color="--color-fgcolor-neutral-primary">
                                {formatTimeDetailed(deployment.buildTime)}
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                    <Layout.Stack gap="xxs" inline>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            Total size
                        </Typography.Text>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-primary">
                            {totalSize.value}{totalSize.unit}
                        </Typography.Text>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs" inline>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                Global CDN <Tooltip>
                                    <Icon icon={IconInfo} size="s" />
                                    <span slot="tooltip">
                                        Optimized speed by caching content on servers closer to
                                        users.
                                    </span>
                                </Tooltip>
                            </Layout.Stack>
                        </Typography.Text>
                        <Layout.Stack inline alignItems="flex-start">
                            <Badge
                                size="xs"
                                variant="secondary"
                                type={isCloud ? 'success' : null}
                                content={isCloud ? 'Connected' : 'Available on Cloud'} />
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack gap="xxs" inline>
                        <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                            <Layout.Stack direction="row" gap="xxs" alignItems="center">
                                DDoS protection <Tooltip>
                                    <Icon icon={IconInfo} size="s" />
                                    <span slot="tooltip">
                                        Safeguards your site by detecting and blocking malicious
                                        traffic.
                                    </span>
                                </Tooltip>
                            </Layout.Stack>
                        </Typography.Text>
                        <Layout.Stack inline alignItems="flex-start">
                            <Badge
                                size="xs"
                                variant="secondary"
                                type={isCloud ? 'success' : null}
                                content={isCloud ? 'Connected' : 'Available on Cloud'} />
                        </Layout.Stack>
                    </Layout.Stack>
                </Layout.Stack>
                <Layout.Stack gap="xxs">
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-tertiary">
                        Source
                    </Typography.Text>
                    <Typography.Text variant="m-400" color="--color-fgcolor-neutral-primary">
                        <DeploymentSource {deployment} />
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
            <!-- </Layout.Stack> -->
        </div>
        {#if $$slots.footer}
            <span
                style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;">
                <Divider />
            </span>
            <Layout.Stack direction="row-reverse">
                <slot name="footer" />
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Card>

{#if show && siteUrl}
    <OpenOnMobileModal bind:show siteURL={siteUrl} />
{/if}

<style lang="scss">
    .card-grid {
        display: grid;
        grid-template-columns: 45% auto;
        // justify-content: center;
        align-items: center;
        gap: var(--gap-xl);

        @media (max-width: 930px) {
            grid-template-columns: 1fr;
        }
    }
</style>
