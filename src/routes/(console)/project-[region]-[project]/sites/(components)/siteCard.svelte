<script lang="ts">
    import { Card } from '$lib/components/index.js';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import { ImageFormat, type Models } from '@appwrite.io/console';
    import { page } from '$app/state';
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
    import { DeploymentSource, DeploymentCreatedBy } from '$lib/components/git';
    import { IconInfo } from '@appwrite.io/pink-icons-svelte';
    import OpenOnMobileModal from './openOnMobileModal.svelte';
    import DeploymentDomains from '$lib/components/git/deploymentDomains.svelte';
    import { app } from '$lib/stores/app';
    import { base } from '$app/paths';
    import { isCloud } from '$lib/system';
    import { sdk } from '$lib/stores/sdk';
    import { capitalize } from '$lib/helpers/string';
    import { getEffectiveBuildStatus, getBuildTimeoutSeconds } from '$lib/helpers/buildTimeout';
    import { regionalConsoleVariables } from '$routes/(console)/project-[region]-[project]/store';
    import { regionalProtocol } from '$routes/(console)/project-[region]-[project]/store';
    import type { Snippet } from 'svelte';

    let {
        deployment,
        proxyRuleList,
        hideQRCode = false,
        variant = 'primary',
        footer
    }: {
        deployment: Models.Deployment;
        proxyRuleList: Models.ProxyRuleList;
        hideQRCode?: boolean;
        variant?: 'primary' | 'secondary';
        footer?: Snippet;
    } = $props();

    let effectiveStatus = $derived(
        getEffectiveBuildStatus(
            deployment.status,
            deployment.$createdAt,
            getBuildTimeoutSeconds($regionalConsoleVariables)
        )
    );
    let show = $state(false);

    const totalSize = $derived(humanFileSize(deployment?.totalSize ?? 0));

    const sortedDomains = $derived(
        proxyRuleList?.rules?.slice()?.sort((a, b) => {
            if (a?.trigger === 'manual' && b?.trigger !== 'manual') return -1;
            if (a?.trigger !== 'manual' && b?.trigger === 'manual') return 1;
            return 0;
        })
    );
    const primaryDomain = $derived(sortedDomains?.[0]?.domain);

    function getScreenshot(theme: string, deployment: Models.Deployment) {
        if (theme === 'dark') {
            return deployment.screenshotDark
                ? getFilePreview(deployment.screenshotDark)
                : `${base}/images/sites/screenshot-placeholder-dark.svg`;
        } else {
            return deployment.screenshotLight
                ? getFilePreview(deployment.screenshotLight)
                : `${base}/images/sites/screenshot-placeholder-light.svg`;
        }
    }

    function getFilePreview(fileId: string) {
        return sdk.forConsoleIn(page.params.region).storage.getFilePreview({
            bucketId: 'screenshots',
            fileId,
            width: 1024,
            height: 576,
            output: ImageFormat.Avif
        });
    }
</script>

<Card padding="s" radius="m" {variant}>
    <Layout.Stack gap="l">
        <div class="card-grid">
            {#if primaryDomain}
                <Card href={`${$regionalProtocol}${primaryDomain}`} padding="none" radius="s">
                    <Image
                        border
                        radius="s"
                        ratio="16/9"
                        style="width: 100%; align-self: start"
                        src={getScreenshot($app.themeInUse, deployment)}
                        alt="Screenshot" />
                </Card>
            {:else}
                <Image
                    border
                    radius="s"
                    ratio="16/9"
                    style="width: 100%; align-self: start"
                    src={getScreenshot($app.themeInUse, deployment)}
                    alt="Screenshot" />
            {/if}

            <Layout.Stack gap="xl">
                <Layout.Stack direction="row" alignItems="flex-start">
                    <Layout.Stack gap="xxs">
                        <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                            Domains
                        </Typography.Text>
                        <DeploymentDomains
                            domains={proxyRuleList}
                            {hideQRCode}
                            showQR={() => (show = !show)} />
                    </Layout.Stack>
                </Layout.Stack>

                <Layout.Stack direction="row" gap="xl">
                    {#if effectiveStatus === 'failed'}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Status
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                <Status
                                    status={effectiveStatus}
                                    label={capitalize(effectiveStatus)} />
                            </Typography.Text>
                        </Layout.Stack>
                    {:else}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Deployed
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                <DeploymentCreatedBy {deployment} />
                            </Typography.Text>
                        </Layout.Stack>
                    {/if}
                </Layout.Stack>

                <Layout.Stack gap="xxl" direction="row" wrap="wrap">
                    <Layout.Stack gap="xxl" direction="row" wrap="wrap" inline>
                        {#if deployment?.buildDuration}
                            <Layout.Stack gap="xxs" inline>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                    Build duration
                                </Typography.Text>
                                <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                    {formatTimeDetailed(deployment.buildDuration)}
                                </Typography.Text>
                            </Layout.Stack>
                        {/if}
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                                Total size
                            </Typography.Text>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                                {totalSize.value}{totalSize.unit}
                            </Typography.Text>
                        </Layout.Stack>
                    </Layout.Stack>
                    <Layout.Stack gap="xxl" direction="row" wrap="wrap" inline>
                        <Layout.Stack gap="xxs" inline>
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
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
                            <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
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
                </Layout.Stack>
                <Layout.Stack gap="xxs" inline style="width: min-content;">
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-tertiary">
                        Source
                    </Typography.Text>
                    <Typography.Text variant="m-400" color="--fgcolor-neutral-primary">
                        <DeploymentSource {deployment} />
                    </Typography.Text>
                </Layout.Stack>
            </Layout.Stack>
        </div>
        {#if footer}
            <span
                style="margin-left: calc(-1* var(--space-7));margin-right: calc(-1* var(--space-7));width:auto;">
                <Divider />
            </span>
            <Layout.Stack direction="row-reverse">
                {@render footer?.()}
            </Layout.Stack>
        {/if}
    </Layout.Stack>
</Card>

{#if show && proxyRuleList.total}
    <OpenOnMobileModal bind:show {proxyRuleList} />
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
