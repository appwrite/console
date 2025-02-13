<script lang="ts">
    import { Card, Trim } from '$lib/components/index.js';
    import Link from '$lib/elements/link.svelte';
    import { humanFileSize } from '$lib/helpers/sizeConvertion';
    import { formatTimeDetailed } from '$lib/helpers/timeConversion';
    import type { Models } from '@appwrite.io/console';
    import { Divider, Icon, Image, Layout, Status, Typography } from '@appwrite.io/pink-svelte';
    import DeploymentSource from './deploymentSource.svelte';
    import DeploymentCreatedBy from './deploymentCreatedBy.svelte';
    import { Button } from '$lib/elements/forms';
    import { IconExternalLink, IconQrcode } from '@appwrite.io/pink-icons-svelte';
    import OpenOnMobileModal from './openOnMobileModal.svelte';
    import DeploymentDomains from './deploymentDomains.svelte';
    import { protocol } from '$routes/(console)/store';
    import { app } from '$lib/stores/app';
    import PlaceholderLight from './screenshot-placeholder-light.svg';
    import PlaceholderDark from './screenshot-placeholder-dark.svg';

    export let deployment: Models.Deployment;
    export let proxyRuleList: Models.ProxyRuleList = { total: 0, rules: [] };
    export let hideQRCode = false;

    let show = false;
    const siteUrl =
        deployment.domain ?? (proxyRuleList.total > 0 ? proxyRuleList.rules[0].domain : undefined);

    $: totalSize = humanFileSize((deployment?.buildSize ?? 0) + (deployment?.size ?? 0));
</script>

<Card padding="s" radius="m">
    <Layout.Stack gap="l">
        <Layout.Stack gap="xl" direction="row" alignItems="center">
            {#if deployment?.preview}
                <Image
                    border
                    radius="s"
                    width={445}
                    height={280}
                    src={deployment?.preview}
                    alt="Screenshot" />
            {:else if $app.themeInUse === 'dark'}
                <Image
                    border
                    radius="s"
                    width={400}
                    height={280}
                    src={PlaceholderDark}
                    alt="Screenshot" />
            {:else}
                <Image
                    border
                    radius="s"
                    width={400}
                    height={280}
                    src={PlaceholderLight}
                    alt="Screenshot" />
            {/if}
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
                            <Icon icon={IconQrcode} />
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
                <Layout.Stack gap="xl" direction="row">
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
        </Layout.Stack>

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
